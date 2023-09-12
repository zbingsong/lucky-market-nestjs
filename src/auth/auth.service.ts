import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt.payload';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/common/entities';
import { Repository } from 'typeorm';
import { JwtTokenDto } from './dto/jwt-token.dto';
import * as bcrypt from 'bcrypt';
import { AppConfig, HashingConfig } from 'src/common/config';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private readonly hashingConfig: HashingConfig;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.hashingConfig = configService.get<HashingConfig>('hashing');
  }

  /**
   * for login guard
   * @param usernameOrEmail username or email of user
   * @param password password of user
   * @returns a UserEntity if valid, null otherwise
   */
  async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<UserEntity | null> {
    const user: UserEntity | null = await this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    const hashedPassword: string = bcrypt.hashSync(
      password,
      this.hashingConfig.rounds,
    );
    if (!user || !bcrypt.compareSync(hashedPassword, user.password)) {
      return null;
    }
    return user;
  }

  async login(user: UserEntity): Promise<JwtTokenDto> {
    const jwtPayload: JwtPayload = { userId: user.id };
    const jwtToken: string = this.jwtService.sign(jwtPayload);
    // TODO: store session
    return { access_token: jwtToken };
  }

  async logout(user: UserEntity): Promise<void> {
    // TODO: remove session
    this.cacheManager.del(user.id);
  }
}
