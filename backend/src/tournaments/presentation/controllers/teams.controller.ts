import {
  Body,
  Controller,
  ForbiddenException,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterTeamUseCase } from '../../application/use-cases/register-team.use-case';
import { RegisterTeamDto } from '../dto/register-team.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

@ApiTags('teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  constructor(
    private readonly registerTeam: RegisterTeamUseCase,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Register a team for a tournament (with full member roster). The tournament organizer (or ADMIN) may register a team after the registration deadline and must specify the captain.',
  })
  async register(@CurrentUser() user: AuthUser, @Body() dto: RegisterTeamDto) {
    if (!user) throw new ForbiddenException('Authentication required');

    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: Number(dto.tournamentId) },
      select: { created_by: true },
    });
    const requesterIsOwnerOrAdmin =
      user.roles.includes('ADMIN') ||
      tournament?.created_by === Number(user.id);

    // If organizer/admin, they must specify the captain.
    // If regular user, they are the captain.
    let captainId: string;
    let captainEmail: string;

    if (requesterIsOwnerOrAdmin) {
      if (!dto.captainId || !dto.captainEmail) {
        throw new ForbiddenException(
          'As an organizer, you must specify captainId and captainEmail when registering a team',
        );
      }
      captainId = dto.captainId;
      captainEmail = dto.captainEmail;
    } else {
      captainId = user.id;
      captainEmail = user.email;
    }

    return this.registerTeam.execute({
      tournamentId: dto.tournamentId,
      captainId,
      captainEmail,
      name: dto.name,
      members: dto.members ?? [],
      requesterIsOwnerOrAdmin,
    });
  }
}
