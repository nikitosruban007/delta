import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RegisterTeamDto {
  @ApiProperty()
  @IsString()
  tournamentId!: string;

  @ApiProperty()
  @IsString()
  captainId!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 120)
  name!: string;
}
