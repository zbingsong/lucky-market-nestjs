import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt.payload';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  ProductEntity,
  SessionEntity,
  StoreEntity,
  UserEntity,
} from 'src/common/entities';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppConfig, HashingConfig, TtlsConfig } from 'src/common/config';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisClientType } from 'redis';
import { RedisCache } from 'cache-manager-redis-yet';
import { nanoid } from 'nanoid';
import { UserRegisterDto } from './dto';
import { ICurrentUser } from 'src/common/interfaces';
import { Role } from 'src/common/enums';

@Injectable()
export class AuthService {
  private readonly hashingConfig: HashingConfig;
  /* extract out redis client to use all possible Redis commands */
  private readonly redisClient: RedisClientType;
  private readonly sessionTtl: number;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: RedisCache,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
    readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.hashingConfig = configService.get<HashingConfig>('hashing');
    this.redisClient = this.cacheManager.store.client;
    this.sessionTtl = configService.get<TtlsConfig>('ttls').session;
  }

  /**
   * For login guard
   * @param usernameOrEmail username or email of user
   * @param password password of user
   * @returns a UserEntity if valid, null otherwise
   */
  async validateUserCredential(
    usernameOrEmail: string,
    password: string,
  ): Promise<UserEntity | null> {
    // find user by username or email
    const user: UserEntity | null = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user) {
      return null;
    }
    // check password
    const hashedPassword: string = bcrypt.hashSync(
      password,
      this.hashingConfig.rounds,
    );
    if (!bcrypt.compareSync(hashedPassword, user.password)) {
      return null;
    }
    return user;
  }

  /**
   * For Jwt guard
   * @param sessionId id of session contained in JWT token
   * @returns UserEntity if session is valid, null otherwise
   */
  async validateSession(sessionId: string): Promise<UserEntity | null> {
    const sessionCacheKey: string = this.getSessionCacheKey(sessionId);
    let userId: string | null = await this.redisClient.get(sessionCacheKey);
    // if session is not in Redis, check session in Postgres
    if (!userId) {
      const session: SessionEntity | null =
        await this.sessionRepository.findOneBy({ id: sessionId });
      // if session is not in Postgres, then this token is invalid
      if (!session) {
        return null;
      }
      // otherwise, there is data inconsistency between database and cache
      // store session in Redis to fix the inconsistency
      await this.redisClient.set(sessionCacheKey, session.userId, {
        PXAT: session.expiresAt.getTime(),
      });
      userId = session.userId;
    }
    // retrieve user from database
    const user: UserEntity | null = await this.userRepository.findOneBy({
      id: userId,
    });
    return user;
  }

  /**
   * Register a new user
   * @param userReg information of user to be registered
   * @returns ICurrentUser of the registered user if registration is successful
   * @exception ConflictException if username or email is taken
   * @exception InternalServerErrorException if registration fails due to database error
   */
  async register(userReg: UserRegisterDto): Promise<ICurrentUser> {
    // check if username or email is taken
    const ifUsernameOrEmailOccupied: boolean = await this.userRepository.exist({
      where: [{ username: userReg.username }, { email: userReg.email }],
    });
    if (ifUsernameOrEmailOccupied) {
      throw new ConflictException('Username or email is taken');
    }
    // create user
    const user: UserEntity = this.userRepository.create({
      username: userReg.username,
      email: userReg.email,
      password: bcrypt.hashSync(userReg.password, this.hashingConfig.rounds),
      role: Role.REGULAR,
    });
    if (userReg.phone) {
      user.phone = userReg.phone;
    }
    // create a store for user
    const store: StoreEntity = this.storeRepository.create({
      owner: Promise.resolve(user),
      products: Promise.resolve([] as ProductEntity[]),
    });
    // associate user with store
    user.store = Promise.resolve(store);
    // save user and store
    try {
      await this.entityManager.transaction(async (manager: EntityManager) => {
        await manager.save([user, store]);
      });
    } catch (err: any) {
      throw new InternalServerErrorException(
        'Internal server error during registration',
      );
    }
    // return current user info
    const currentUser: ICurrentUser = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    return currentUser;
  }

  /**
   * Create a session for user, issue a JWT token and store session in
   * database and Redis
   * ASSUMPTION: user exists
   * @param user current user requesting login
   * @returns TODO
   */
  async createSession(userId: string): Promise<string> {
    // create a session in database
    const sessionId: string = nanoid(16);
    const jwtPayload: JwtPayload = { sessionId };
    const jwtToken: string = this.jwtService.sign(jwtPayload);
    const session = this.sessionRepository.create({
      id: sessionId,
      userId: userId,
      token: jwtToken,
      expiresAt: new Date(Date.now() + this.sessionTtl),
    });
    // try saving session to database and Redis
    const sessionCacheKey: string = this.getSessionCacheKey(sessionId);
    try {
      await Promise.all([
        this.sessionRepository.save(session),
        this.redisClient.set(sessionCacheKey, userId, {
          PXAT: session.expiresAt.getTime(),
        }),
      ]);
    } catch (err: any) {
      // if failed, delete session in database and Redis
      this.sessionRepository.delete(sessionId);
      this.redisClient.del(sessionCacheKey);
      throw new InternalServerErrorException(
        'Internel server error during login',
      );
    }
    return jwtToken;
  }

  /**
   * Remove a session (logout)
   * @param sessionId id of the session to be logged out
   */
  async deleteSession(jwtToken: string): Promise<void> {
    // first find the session corresponding to the token
    const session: SessionEntity | null =
      await this.sessionRepository.findOneBy({ token: jwtToken });
    if (!session) {
      return;
    }
    const sessionId = session.id;
    // delete session in Redis and Postgres
    await Promise.all([
      this.redisClient.del(this.getSessionCacheKey(sessionId)),
      this.sessionRepository.delete(sessionId),
    ]);
  }

  /**
   * Convert session id to key for storing session in Redis
   * @param sessionId id of session
   * @returns key for storing session in Redis
   */
  private getSessionCacheKey(sessionId: string): string {
    return `auth:sessions:${sessionId}`;
  }
}
