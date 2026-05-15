import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';
import { DispatchNotificationUseCase } from '../../../notifications/application/use-cases/dispatch-notification.use-case';
import { NotificationChannel } from '../../../notifications/domain/notification-channel.enum';

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
    private readonly dispatcher: DispatchNotificationUseCase,
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

    await this.notifier.emitToTournament(
      input.tournamentId,
      'announcement.created',
      result,
    );

    try {
      const teams = await this.prisma.tournament_teams.findMany({
        where: { tournament_id: tournamentId },
        include: { teams: { select: { captain_id: true } } },
      });
      const captainIds = Array.from(
        new Set(
          teams
            .map((t) => t.teams?.captain_id)
            .filter((x): x is number => typeof x === 'number'),
        ),
      );
      if (captainIds.length > 0) {
        await this.dispatcher.execute({
          recipients: captainIds.map((id) => ({ userId: String(id) })),
          subject: `Оголошення: ${input.title}`,
          body: input.body.slice(0, 500),
          channels: [NotificationChannel.IN_APP],
        });
      }
    } catch (err) {
      console.warn('[create-announcement] dispatch notification failed', err);
    }

    return result;
  }
}
