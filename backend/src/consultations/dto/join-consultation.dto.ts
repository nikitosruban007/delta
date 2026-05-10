import { IsString } from 'class-validator';

export class JoinConsultationDto {
  @IsString()
  consultationId!: string;
}
