import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import path from 'path';
import { AppConfig, RedisConfig } from './common/config';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';

const YAML_CONFIG_NAME = 'config.yaml';

@Module({
  imports: [
    // for injecting configurations from yaml file into other modules
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => {
          const yamlConfig = readFileSync(
            path.join(__dirname, YAML_CONFIG_NAME),
            'utf8',
          );
          return yaml.load(yamlConfig);
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
      useFactory: (configService: ConfigService) => ({
        ...configService.get<TypeOrmModuleOptions>('database'),
        synchronize: true,
        entities: [__dirname + '/**/common/entities/*.entity{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    // for mongodb
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get<string>('MONGO_URI'),
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    // for redis
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
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
  ],
})
export class AppModule {}
