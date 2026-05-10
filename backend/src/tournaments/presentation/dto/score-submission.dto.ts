import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ScoreSubmissionDto {
  @ApiProperty()
  @IsString()
  submissionId!: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
