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

export interface SubmitWorkInput {
  stageId: string;
  teamId: string;
  userId: string;
  githubUrl: string;
  videoUrl?: string | null;
  liveDemoUrl?: string | null;
  description?: string | null;
}

@Injectable()
export class SubmitWorkUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: SubmitWorkInput) {
    const stageId = Number(input.stageId);
    const teamId = Number(input.teamId);
    const userId = Number(input.userId);

    if (!input.githubUrl) {
      throw new BadRequestException('GitHub URL is required');
    }

    const stage = await this.prisma.rounds.findUnique({
      where: { id: stageId },
      include: { tournaments: true },
    });
    if (!stage) throw new NotFoundException('Round not found');

    if (stage.deadline_at && stage.deadline_at.getTime() < Date.now()) {
      throw new BadRequestException('Round deadline has passed; submissions are closed');
    }

    if (stage.tournaments.status !== 'active' && stage.tournaments.status !== 'registration') {
      throw new BadRequestException(
        `Submissions are not accepted in tournament status: ${stage.tournaments.status}`,
      );
    }

    const membership = await this.prisma.team_members.findFirst({
      where: { team_id: teamId, user_id: userId },
      select: { id: true },
    });
    if (!membership) throw new ForbiddenException('You are not a member of this team');

    // Team must be registered in this tournament
    const link = await this.prisma.tournament_teams.findFirst({
      where: { tournament_id: stage.tournament_id, team_id: teamId },
      select: { id: true },
    });
    if (!link) throw new ForbiddenException('Team is not registered in this tournament');

    const existing = await this.prisma.submissions.findFirst({
      where: { team_id: teamId, round_id: stageId },
    });

    const data = {
      github_url: input.githubUrl,
      video_url: input.videoUrl ?? null,
      live_demo_url: input.liveDemoUrl ?? null,
      description: input.description ?? null,
      status: 'submitted' as const,
      updated_at: new Date(),
    };

    const submission = existing
      ? await this.prisma.submissions.update({ where: { id: existing.id }, data })
      : await this.prisma.submissions.create({
          data: { team_id: teamId, round_id: stageId, ...data },
        });

    await this.notifier.emitToTournament(
      String(stage.tournament_id),
      'submission.created',
      { id: String(submission.id), teamId: String(teamId), roundId: String(stageId) },
    );

    return {
      id: String(submission.id),
      teamId: String(submission.team_id),
      roundId: String(submission.round_id),
      githubUrl: submission.github_url,
      videoUrl: submission.video_url,
      liveDemoUrl: submission.live_demo_url,
      description: submission.description,
      status: submission.status,
      createdAt: submission.created_at,
      updatedAt: submission.updated_at,
    };
  }
}
