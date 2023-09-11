import { IsDefined, IsString } from 'class-validator';

export class HashingConfig {
  @IsDefined()
  @IsString()
  passwordSecret!: string;
}
