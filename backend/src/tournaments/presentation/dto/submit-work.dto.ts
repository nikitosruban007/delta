import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsUrl } from 'class-validator';

export class SubmitWorkDto {
  @ApiProperty()
  @IsString()
  stageId!: string;

  @ApiProperty()
  @IsString()
  teamId!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  contentUrl?: string;
}
