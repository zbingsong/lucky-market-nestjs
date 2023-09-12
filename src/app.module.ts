import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { join } from 'path';
import {
  AppConfig,
  MongoConfig,
  PostgresConfig,
  RedisConfig,
} from './common/config';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { AuthModule } from './auth/auth.module';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';

const YAML_CONFIG_NAME = 'config.yaml';

@Module({
  imports: [
    // for injecting configurations from yaml file into other modules
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => {
          const yamlConfig = readFileSync(
            join(__dirname, YAML_CONFIG_NAME),
            'utf8',
          );
          return yaml.load(yamlConfig) as Record<string, any>;
        },
      ],
      validationSchema: new AppConfig(),
      validate: (config) => {
        const validatedConfig = plainToClass(AppConfig, config, {
          enableImplicitConversion: true,
        });
        const errors = validateSync(validatedConfig, {
          skipMissingProperties: false,
        });
        if (errors.length > 0) {
          throw new Error(errors.toString());
        }
        return validatedConfig;
      },
    }),
    // for postgres db
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const postgresConfig = configService.get<PostgresConfig>('postgres');
        return {
          ...postgresConfig,
          synchronize: true,
          entities: [__dirname + '/**/common/entities/*.entity{.ts,.js}'],
        } as TypeOrmModuleOptions;
      },
    }),
    // for mongodb
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AppConfig, true>) => {
        const mongoConfig: MongoConfig =
          configService.get<MongoConfig>('mongo');
        return {
          uri: mongoConfig.uri,
          dbName: mongoConfig.dbName,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        } as MongooseModuleOptions;
      },
      inject: [ConfigService],
    }),
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
          database: redisConfig.dbs.default,
          ttl: redisConfig.ttls.default,
        };
      },
    }),
    ProductModule,
    StoreModule,
    UserModule,
    AuthModule,
    AdminModule,
  ],
})
export class AppModule {}
