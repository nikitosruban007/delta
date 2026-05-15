import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateStageDto {
  @ApiProperty()
  @IsString()
  tournamentId!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  orderIndex!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadlineAt?: string;
}
