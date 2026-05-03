import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PublishTournamentDto {
  @ApiProperty()
  @IsString()
  tournamentId!: string;
}
