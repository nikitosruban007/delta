import { IsString } from 'class-validator';

export class StartConsultationDto {
  @IsString()
  consultationId!: string;
}
