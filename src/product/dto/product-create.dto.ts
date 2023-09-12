import { IsString, MaxLength } from 'class-validator';

export class ProductCreateDto {
  @IsString()
  @MaxLength(127)
  title!: string;

  @IsString()
  @MaxLength(2047)
  description!: string;
}
