import { IsArray, IsDateString, IsOptional, IsString, MaxLength, ArrayUnique } from 'class-validator';

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

  @IsArray()
  @ArrayUnique()
  @IsOptional()
  participantIds?: string[] = [];

  @IsString()
  createdById!: string; // TODO: replace with real user relation after auth/users integration
}
