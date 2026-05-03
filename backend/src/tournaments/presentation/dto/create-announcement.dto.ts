import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  tournamentId!: string;

  @ApiProperty()
  @IsString()
  authorId!: string;

  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title!: string;

  @ApiProperty()
  @IsString()
  @Length(10, 10000)
  body!: string;
}
