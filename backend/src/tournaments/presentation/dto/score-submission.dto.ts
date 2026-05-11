import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CriterionScoreDto {
  @ApiProperty()
  @IsInt()
  criterionId!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  score!: number;
}

export class ScoreSubmissionDto {
  @ApiProperty()
  @IsString()
  submissionId!: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({ type: [CriterionScoreDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CriterionScoreDto)
  criteria?: CriterionScoreDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
