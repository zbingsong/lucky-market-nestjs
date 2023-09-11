import { IsDefined, IsString } from 'class-validator';

export class JwtConfig {
  @IsDefined()
  @IsString()
  secret!: string;
}
