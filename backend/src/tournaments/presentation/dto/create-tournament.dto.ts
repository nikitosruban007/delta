import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTournamentDto {
  @ApiProperty({ example: 'KPI Hackathon 2026' })
  @IsString()
  @Length(3, 200)
  title!: string;

  @ApiPropertyOptional({ example: 'Annual student competition' })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-10T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @ApiPropertyOptional({ example: '2026-05-12T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-05-20T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
