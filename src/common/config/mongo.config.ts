import { IsDefined, IsString } from 'class-validator';

export class MongoConfig {
  @IsDefined()
  @IsString()
  uri!: string;

  @IsDefined()
  @IsString()
  dbName!: string;
}
