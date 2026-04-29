import { IsString } from 'class-validator';

export class StartConsultationDto {
  @IsString()
  consultationId!: string;

  @IsString()
  userId!: string; // must be host - TODO: integrate with auth
}
