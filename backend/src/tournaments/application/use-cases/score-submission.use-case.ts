import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';

export interface ScoreSubmissionInput {
  submissionId: string;
  judgeId: string;
  score: number;
  comment?: string | null;
}

@Injectable()
export class ScoreSubmissionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: ScoreSubmissionInput) {
    const submissionId = Number(input.submissionId);
    const judgeId = Number(input.judgeId);

    const submission = await this.prisma.submissions.findUnique({
      where: { id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    const existing = await this.prisma.evaluations.findFirst({
      where: { submission_id: submissionId, jury_id: judgeId },
    });

    let evaluation: Awaited<ReturnType<typeof this.prisma.evaluations.create>>;
    if (existing) {
      evaluation = await this.prisma.evaluations.update({
        where: { id: existing.id },
        data: {
          total_score: input.score,
          comment: input.comment ?? null,
        },
      });
    } else {
      evaluation = await this.prisma.evaluations.create({
        data: {
          submission_id: submissionId,
          jury_id: judgeId,
          total_score: input.score,
          comment: input.comment ?? null,
        },
      });
    }

    await this.prisma.submissions.update({
      where: { id: submissionId },
      data: { status: 'reviewed' },
    });

    await this.notifier.emitToUser(input.judgeId, 'submission.scored', {
      submissionId: input.submissionId,
      score: input.score,
      comment: input.comment ?? null,
      evaluationId: evaluation.id,
    });

    return evaluation;
  }
}
