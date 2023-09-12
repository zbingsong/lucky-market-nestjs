import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt.payload';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/common/entities';
import { Repository } from 'typeorm';
import { JwtTokenDto } from './dto/jwt-token.dto';
import * as bcrypt from 'bcrypt';
import { AppConfig, HashingConfig } from 'src/common/config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly hashingConfig: HashingConfig;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.hashingConfig = configService.get<HashingConfig>('hashing');
  }

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
}
