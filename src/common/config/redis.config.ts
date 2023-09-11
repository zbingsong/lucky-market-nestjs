import { Type } from 'class-transformer';
import {
  IsDefined,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RedisDbConfig {
  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(7)
  default!: number;
}

export class RedisTtlConfig {
  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(40000000)
  default!: number;
}

export class RedisConfig {
  @IsDefined()
  @IsString()
  host!: string;

  @IsDefined()
  @IsInt()
  @Min(1024)
  @Max(65535)
  port!: number;

  @IsDefined()
  @Type(() => RedisDbConfig)
  @ValidateNested()
  dbs!: RedisDbConfig;

  @IsDefined()
  @Type(() => RedisTtlConfig)
  @ValidateNested()
  ttls!: RedisTtlConfig;
}
