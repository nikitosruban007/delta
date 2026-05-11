import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';

export interface CreateAnnouncementInput {
  tournamentId: string;
  authorId: string;
  title: string;
  body: string;
  authorIsAdmin: boolean;
}

@Injectable()
export class CreateAnnouncementUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: CreateAnnouncementInput) {
    const tournamentId = Number(input.tournamentId);
    const authorId = Number(input.authorId);

    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (!input.authorIsAdmin && tournament.created_by !== authorId) {
      throw new ForbiddenException('You do not own this tournament');
    }

    const row = await this.prisma.announcements.create({
      data: {
        tournament_id: tournamentId,
        author_id: authorId,
        title: input.title,
        body: input.body,
      },
    });

    const result = {
      id: String(row.id),
      tournamentId: String(row.tournament_id),
      authorId: row.author_id ? String(row.author_id) : '',
      title: row.title,
      body: row.body,
      createdAt: row.created_at ?? new Date(),
      updatedAt: row.updated_at ?? new Date(),
    };

    await this.notifier.emitToTournament(input.tournamentId, 'announcement.created', result);
    return result;
  }
}
