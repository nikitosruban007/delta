import { IsString } from 'class-validator';

export class EndConsultationDto {
  @IsString()
  consultationId!: string;
}
