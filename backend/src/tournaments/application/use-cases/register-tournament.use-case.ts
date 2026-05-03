import { Inject, Injectable } from '@nestjs/common';
import { TournamentRepositoryPort, TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import { CachePort, CACHE_PORT } from '../ports/cache.port';
import { NotificationPort, NOTIFICATION_PORT } from '../ports/notification.port';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';

export interface RegisterTournamentInput {
  organizerId: string;
  title: string;
  description?: string | null;
  registrationDeadline?: Date | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

@Injectable()
export class RegisterTournamentUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: RegisterTournamentInput) {
    const tournament = await this.repo.createTournament({
      organizerId: input.organizerId,
      title: input.title,
      description: input.description ?? null,
      registrationDeadline: input.registrationDeadline ?? null,
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
      status: TournamentStatus.DRAFT,
    });

    await this.cache.set(`tournaments:${tournament.id}`, tournament, 300);
    await this.notifier.emitToUser(input.organizerId, 'tournament.created', tournament);

    return tournament;
  }
}
