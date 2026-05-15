import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  ArrayUnique,
  IsNumber,
} from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsNumber()
  tournament_id!: number;

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  participantIds?: string[] = [];
}
