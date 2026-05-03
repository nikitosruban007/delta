import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AssignJudgeDto {
  @ApiProperty()
  @IsString()
  tournamentId!: string;

  @ApiProperty()
  @IsString()
  judgeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stageId?: string;
}
