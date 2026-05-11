import { Body, Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterTeamUseCase } from '../../application/use-cases/register-team.use-case';
import { RegisterTeamDto } from '../dto/register-team.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';

type AuthUser = { id: string; email: string; roles: string[]; permissions: string[] };

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  constructor(private readonly registerTeam: RegisterTeamUseCase) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register a team for a tournament (with full member roster)' })
  register(@CurrentUser() user: AuthUser, @Body() dto: RegisterTeamDto) {
    if (!user) throw new ForbiddenException('Authentication required');
    return this.registerTeam.execute({
      tournamentId: dto.tournamentId,
      captainId: user.id,
      captainEmail: user.email,
      name: dto.name,
      members: dto.members ?? [],
    });
  }
}
