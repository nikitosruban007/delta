import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { NotificationChannel } from '../../domain/notification-channel.enum';

export class DispatchRecipientDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class DispatchNotificationDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DispatchRecipientDto)
  recipients!: DispatchRecipientDto[];

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(NotificationChannel, { each: true })
  channels!: NotificationChannel[];
}
