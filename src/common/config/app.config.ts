import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { PostgresConfig } from './postgres.config';
import { JwtConfig } from './jwt.config';
import { RedisConfig } from './redis.config';
import { HashingConfig } from './hashing.config';
import { MongoConfig } from './mongo.config';

export class AppConfig {
  @IsDefined()
  @Type(() => JwtConfig)
  @ValidateNested()
  jwt!: JwtConfig;

  @IsDefined()
  @Type(() => PostgresConfig)
  @ValidateNested()
  postgres!: PostgresConfig;

  @IsDefined()
  @Type(() => MongoConfig)
  @ValidateNested()
  mongo!: MongoConfig;

  @IsDefined()
  @Type(() => RedisConfig)
  @ValidateNested()
  redis!: RedisConfig;

  @IsDefined()
  @Type(() => HashingConfig)
  @ValidateNested()
  hashing!: HashingConfig;
}
