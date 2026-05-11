import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UpdateTournamentDto } from '../dto/update-tournament.dto';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RegisterTournamentUseCase } from '../../application/use-cases/register-tournament.use-case';
import { PublishTournamentUseCase } from '../../application/use-cases/publish-tournament.use-case';
import { FinishEvaluationUseCase } from '../../application/use-cases/finish-evaluation.use-case';
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
    private readonly finishEvaluation: FinishEvaluationUseCase,
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament fields (owner or admin only)' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTournamentDto,
  ) {
    const tournament = await this.repo.findTournamentById(id);
    if (!tournament) throw new NotFoundException('Tournament not found');
    const isAdmin = user.roles.includes('ADMIN');
    if (!isAdmin && tournament.organizerId !== user.id) {
      throw new ForbiddenException('You do not own this tournament');
    }
    if (
      dto.teamSizeMin !== undefined &&
      dto.teamSizeMax !== undefined &&
      dto.teamSizeMin > dto.teamSizeMax
    ) {
      throw new BadRequestException('teamSizeMin cannot exceed teamSizeMax');
    }
    return this.repo.updateTournament(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.rules !== undefined && { rules: dto.rules }),
      ...(dto.registrationDeadline !== undefined && {
        registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
      }),
      ...(dto.startsAt !== undefined && { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }),
      ...(dto.endsAt !== undefined && { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }),
      ...(dto.maxTeams !== undefined && { maxTeams: dto.maxTeams }),
      ...(dto.teamSizeMin !== undefined && { teamSizeMin: dto.teamSizeMin }),
      ...(dto.teamSizeMax !== undefined && { teamSizeMax: dto.teamSizeMax }),
      ...(dto.status !== undefined && { status: dto.status as TournamentStatus }),
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
    return this.publishTournament.execute(dto.tournamentId, user.id, user.roles.includes('ADMIN'));
  }

  @Post(':id/finish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalize evaluation: lock results, rebuild leaderboard, set finished status' })
  async finish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException('Only admins and organizers can finalize tournaments');
    }
    return this.finishEvaluation.execute({
      tournamentId: id,
      organizerId: user.id,
      organizerIsAdmin: user.roles.includes('ADMIN'),
    });
  }
}
