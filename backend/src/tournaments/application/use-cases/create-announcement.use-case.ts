import { Inject, Injectable } from '@nestjs/common';
import { TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../ports/tournament.repository.port';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';

export interface CreateAnnouncementInput {
  tournamentId: string;
  authorId: string;
  title: string;
  body: string;
}

@Injectable()
export class CreateAnnouncementUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: CreateAnnouncementInput) {
    const announcement = await this.repo.createAnnouncement({
      tournamentId: input.tournamentId,
      authorId: input.authorId,
      title: input.title,
      body: input.body,
    });

    await this.notifier.emitToTournament(input.tournamentId, 'announcement.created', announcement);
    return announcement;
  }
}
