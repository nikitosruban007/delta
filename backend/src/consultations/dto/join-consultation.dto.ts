import { IsString } from 'class-validator';

export class JoinConsultationDto {
  @IsString()
  consultationId!: string;

  @IsString()
  userId!: string; // TODO: integrate with auth, replace with user context
}
