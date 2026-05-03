import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateResultDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  userId!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  score!: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  wins?: number = 0;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  timeMs?: number;
}
