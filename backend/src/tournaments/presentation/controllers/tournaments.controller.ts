import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterTournamentUseCase } from '../../application/use-cases/register-tournament.use-case';
import { PublishTournamentUseCase } from '../../application/use-cases/publish-tournament.use-case';
import { CreateTournamentDto } from '../dto/create-tournament.dto';
import { PublishTournamentDto } from '../dto/publish-tournament.dto';
import { OrganizerGuard } from '../guards/organizer.guard';

@ApiTags('tournaments')
@ApiBearerAuth()
@Controller('tournaments')
export class TournamentsController {
  constructor(
    private readonly registerTournament: RegisterTournamentUseCase,
    private readonly publishTournament: PublishTournamentUseCase,
  ) {}

  @UseGuards(OrganizerGuard)
  @Post()
  create(@Body() dto: CreateTournamentDto) {
    return this.registerTournament.execute({
      organizerId: 'current-user-id',
      title: dto.title,
      description: dto.description ?? null,
      registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : null,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });
  }

  @UseGuards(OrganizerGuard)
  @Put('publish')
  publish(@Body() dto: PublishTournamentDto) {
    return this.publishTournament.execute(dto.tournamentId, 'current-user-id');
  }
}
