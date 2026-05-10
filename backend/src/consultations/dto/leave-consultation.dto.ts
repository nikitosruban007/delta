import { IsString } from 'class-validator';

export class LeaveConsultationDto {
  @IsString()
  consultationId!: string;
}
