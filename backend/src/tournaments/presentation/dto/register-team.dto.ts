import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class TeamMemberDto {
  @ApiProperty()
  @IsString()
  @Length(2, 200)
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class RegisterTeamDto {
  @ApiProperty()
  @IsString()
  tournamentId!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 120)
  name!: string;

  @ApiProperty({
    required: false,
    description:
      'Captain ID (optional for non-organizers; required for organizers)',
  })
  @IsString()
  @IsOptional()
  captainId?: string;

  @ApiProperty({
    required: false,
    description:
      'Captain email (optional for non-organizers; required for organizers)',
  })
  @IsEmail()
  @IsOptional()
  captainEmail?: string;

  @ApiProperty({
    type: [TeamMemberDto],
    description: 'Team members (captain not included here; only other members)',
  })
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  @IsOptional()
  members?: TeamMemberDto[];
}
