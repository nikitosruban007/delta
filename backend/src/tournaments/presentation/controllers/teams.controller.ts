import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterTeamUseCase } from '../../application/use-cases/register-team.use-case';
import { RegisterTeamDto } from '../dto/register-team.dto';
import { TeamGuard } from '../guards/team.guard';

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  constructor(private readonly registerTeam: RegisterTeamUseCase) {}

  @UseGuards(TeamGuard)
  @Post('register')
  register(@Body() dto: RegisterTeamDto) {
    return this.registerTeam.execute(dto);
  }
}
