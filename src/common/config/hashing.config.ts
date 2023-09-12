import { IsDefined, IsInt, Max, Min } from 'class-validator';

export class HashingConfig {
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(12)
  rounds!: number;
}
