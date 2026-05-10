import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RegisterTournamentUseCase } from '../../application/use-cases/register-tournament.use-case';
import { PublishTournamentUseCase } from '../../application/use-cases/publish-tournament.use-case';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { PublishTournamentDto } from '../dto/publish-tournament.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { Inject } from '@nestjs/common';
import { TOURNAMENT_REPOSITORY } from '../../application/ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../../application/ports/tournament.repository.port';

type AuthUser = { id: string; email: string; roles: string[]; permissions: string[] };

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(
    private readonly registerTournament: RegisterTournamentUseCase,
    private readonly publishTournament: PublishTournamentUseCase,
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List tournaments' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'registration', 'active', 'finished'] })
  list(@Query('status') status?: string) {
    return this.repo.listTournaments(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tournament by id' })
  async getById(@Param('id') id: string) {
    const tournament = await this.repo.findTournamentById(id);
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  @Get(':id/teams')
  @ApiOperation({ summary: 'List teams in a tournament' })
  async getTeams(@Param('id') id: string) {
    const tournament = await this.repo.findTournamentById(id);
    if (!tournament) throw new NotFoundException('Tournament not found');
    return this.repo.findTournamentTeams(id);
  }

  @Get(':id/rounds')
  @ApiOperation({ summary: 'List rounds in a tournament' })
  async getRounds(@Param('id') id: string) {
    const tournament = await this.repo.findTournamentById(id);
    if (!tournament) throw new NotFoundException('Tournament not found');
    return this.repo.listStagesByTournament(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create tournament (Admin/Organizer only)' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateTournamentDto) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException('Only admins and organizers can create tournaments');
    }
    return this.registerTournament.execute({
      organizerId: user.id,
      title: dto.title,
      description: dto.description ?? null,
      registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });
  }

  @Put('publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish tournament (Admin/Organizer only)' })
  async publish(@CurrentUser() user: AuthUser, @Body() dto: PublishTournamentDto) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException('Only admins and organizers can publish tournaments');
    }
    return this.publishTournament.execute(dto.tournamentId, user.id);
  }
}
