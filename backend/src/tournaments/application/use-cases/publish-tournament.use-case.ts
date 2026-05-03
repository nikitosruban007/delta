import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../ports/tournament.repository.port';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';
import { CACHE_PORT } from '../ports/cache.port';
import type { CachePort } from '../ports/cache.port';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';

@Injectable()
export class PublishTournamentUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(tournamentId: string, organizerId: string) {
    const tournament = await this.repo.findTournamentById(tournamentId);
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (tournament.organizerId !== organizerId) throw new BadRequestException('Forbidden');
    if (tournament.status !== TournamentStatus.DRAFT) throw new BadRequestException('Only draft tournaments can be published');

    const updated = await this.repo.updateTournament(tournamentId, {
      status: TournamentStatus.PUBLISHED,
    });

    await this.cache.set(`tournaments:${tournamentId}`, updated, 300);
    await this.notifier.emitToTournament(tournamentId, 'tournament.published', updated);
    return updated;
  }
}
