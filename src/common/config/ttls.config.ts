import { IsDefined, IsInt, Max, Min } from 'class-validator';

/**
 * ttls are in milliseconds
 */
export class TtlsConfig {
  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(700000000)
  session!: number;
}
