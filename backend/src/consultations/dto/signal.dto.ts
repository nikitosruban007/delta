import { IsObject, IsOptional, IsString } from 'class-validator';

export class SignalDto {
  @IsString()
  consultationId!: string;

  @IsString()
  fromUserId!: string;

  @IsOptional()
  @IsString()
  toUserId?: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
