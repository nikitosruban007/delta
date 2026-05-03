import { Inject, Injectable } from '@nestjs/common';
import { TournamentRepositoryPort, TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import { NotificationPort, NOTIFICATION_PORT } from '../ports/notification.port';
import { TeamStatus } from '../../domain/enums/team-status.enum';

export interface RegisterTeamInput {
  tournamentId: string;
  captainId: string;
  name: string;
}

@Injectable()
export class RegisterTeamUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: RegisterTeamInput) {
    const team = await this.repo.createTeam({
      tournamentId: input.tournamentId,
      captainId: input.captainId,
      name: input.name,
      status: TeamStatus.REGISTERED,
    });

    await this.notifier.emitToTournament(input.tournamentId, 'team.registered', team);
    return team;
  }
}
