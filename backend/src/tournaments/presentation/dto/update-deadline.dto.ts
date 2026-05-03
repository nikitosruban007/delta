import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateDeadlineDto {
  @ApiProperty({ enum: ['TOURNAMENT', 'STAGE'] })
  @IsIn(['TOURNAMENT', 'STAGE'])
  entityType!: 'TOURNAMENT' | 'STAGE';

  @ApiProperty()
  @IsString()
  entityId!: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsDateString()
  deadlineAt?: string | null;
}
