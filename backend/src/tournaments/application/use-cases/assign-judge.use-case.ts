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
      const round = await this.prisma.rounds.findUnique({ where: { id: stageId } });
      if (!round || round.tournament_id !== tournamentId) {
        throw new BadRequestException('Round does not belong to this tournament');
      }
    }

    const judge = await this.prisma.users.findUnique({
      where: { id: judgeId },
      include: { user_roles_user_roles_user_idTousers: { include: { roles: true } } },
    });
    if (!judge) throw new NotFoundException('Judge user not found');

    const isJudge = judge.user_roles_user_roles_user_idTousers.some(
      (r) => r.roles?.name === 'JUDGE' || r.roles?.name === 'ADMIN',
    );
    if (!isJudge) throw new BadRequestException('User does not have JUDGE role');

    const existing = await this.prisma.judge_assignments.findFirst({
      where: { tournament_id: tournamentId, judge_id: judgeId, stage_id: stageId },
    });
    const assignment = existing
      ? existing
      : await this.prisma.judge_assignments.create({
          data: { tournament_id: tournamentId, judge_id: judgeId, stage_id: stageId },
        });

    await this.notifier.emitToUser(input.judgeId, 'judge.assigned', {
      id: String(assignment.id),
      tournamentId: input.tournamentId,
      stageId: input.stageId ?? null,
    });

    return {
      id: String(assignment.id),
      tournamentId: String(assignment.tournament_id),
      judgeId: String(assignment.judge_id),
      stageId: assignment.stage_id ? String(assignment.stage_id) : null,
      createdAt: assignment.created_at,
    };
  }
}
