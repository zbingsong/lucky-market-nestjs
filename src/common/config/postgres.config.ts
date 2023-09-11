import { IsDefined, IsInt, IsString, Max, Min } from 'class-validator';

export class PostgresConfig {
  @IsDefined()
  @IsString()
  type!: string;

  @IsDefined()
  @IsString()
  host!: string;

  @IsDefined()
  @IsInt()
  @Min(1024)
  @Max(65535)
  port!: number;

  @IsDefined()
  @IsString()
  username!: string;

  @IsDefined()
  @IsString()
  password!: string;

  @IsDefined()
  @IsString()
  database!: string;
}
