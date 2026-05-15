import {
  BadRequestException,
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

export interface AssignJudgeInput {
  tournamentId: string;
  judgeId: string;
  stageId?: string | null;
  organizerId: string;
  organizerIsAdmin: boolean;
}

@Injectable()
export class AssignJudgeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
    private readonly dispatcher: DispatchNotificationUseCase,
  ) {}

  async execute(input: AssignJudgeInput) {
    const tournamentId = Number(input.tournamentId);
    const judgeId = Number(input.judgeId);
    const stageId = input.stageId ? Number(input.stageId) : null;
    const organizerId = Number(input.organizerId);

    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    if (!input.organizerIsAdmin && tournament.created_by !== organizerId) {
      throw new ForbiddenException('You do not own this tournament');
    }

    if (stageId !== null) {
      const round = await this.prisma.rounds.findUnique({
        where: { id: stageId },
      });
      if (!round || round.tournament_id !== tournamentId) {
        throw new BadRequestException(
          'Round does not belong to this tournament',
        );
      }
    }

    // Any active user may be assigned as a judge. The "judge" role is
    // derived from the existence of a judge_assignments row — there is no
    // standalone JUDGE role gating who can be picked.
    const judge = await this.prisma.users.findUnique({
      where: { id: judgeId },
      select: { id: true, status: true },
    });
    if (!judge) throw new NotFoundException('Judge user not found');
    if (judge.status !== 'active') {
      throw new BadRequestException('User account is not active');
    }

    const existing = await this.prisma.judge_assignments.findFirst({
      where: {
        tournament_id: tournamentId,
        judge_id: judgeId,
        stage_id: stageId,
      },
    });
    const assignment = existing
      ? existing
      : await this.prisma.judge_assignments.create({
          data: {
            tournament_id: tournamentId,
            judge_id: judgeId,
            stage_id: stageId,
          },
        });

    await this.notifier.emitToUser(input.judgeId, 'judge.assigned', {
      id: String(assignment.id),
      tournamentId: input.tournamentId,
      stageId: input.stageId ?? null,
    });

    try {
      await this.dispatcher.execute({
        recipients: [{ userId: input.judgeId }],
        subject: `Вас призначено суддею: ${tournament.title}`,
        body: input.stageId
          ? `Вас призначено суддею раунду #${input.stageId} у турнірі «${tournament.title}».`
          : `Вас призначено суддею турніру «${tournament.title}».`,
        channels: [NotificationChannel.IN_APP],
      });
    } catch (err) {
      console.warn('[assign-judge] dispatch notification failed', err);
    }

    return {
      id: String(assignment.id),
      tournamentId: String(assignment.tournament_id),
      judgeId: String(assignment.judge_id),
      stageId: assignment.stage_id ? String(assignment.stage_id) : null,
      createdAt: assignment.created_at,
    };
  }
}
