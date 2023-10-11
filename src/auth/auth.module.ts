import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, JwtConfig, RedisConfig } from 'src/common/config';
import { PassportModule } from '@nestjs/passport';
import { LoginStrategy } from './login.strategy';
import { JwtStrategy } from './jwt.strategy';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity, StoreEntity, UserEntity } from 'src/common/entities';

@Module({
  imports: [
    // for redis
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AppConfig, true>) => {
        const redisConfig = configService.get<RedisConfig>('redis');
        return {
          store: redisStore,
          socket: {
            host: redisConfig.host,
            port: redisConfig.port,
          },
          database: redisConfig.dbs.auth,
        };
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService<AppConfig, true>) => {
        const jwtConfig: JwtConfig = config.get<JwtConfig>('jwt');
        return {
          secret: jwtConfig.secret,
          signOptions: { expiresIn: jwtConfig.ttl },
        };
      },
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([UserEntity, StoreEntity, SessionEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, LoginStrategy, JwtStrategy],
})
export class AuthModule {}
