import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TournamentRepositoryPort, TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import { NotificationPort, NOTIFICATION_PORT } from '../ports/notification.port';
import { ScoreStatus } from '../../domain/enums/score-status.enum';

export interface ScoreSubmissionInput {
  submissionId: string;
  judgeId: string;
  score: number;
  comment?: string | null;
}

@Injectable()
export class ScoreSubmissionUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: ScoreSubmissionInput) {
    // In a full implementation this would load the submission, verify judge access,
    // persist the evaluation entity and calculate aggregated scores.
    const submission = await this.repo.updateTournament(input.submissionId, {
      status: ScoreStatus.REVIEWED as any,
    }).catch(() => null);

    if (!submission) throw new NotFoundException('Submission not found');

    await this.notifier.emitToUser(input.judgeId, 'submission.scored', {
      submissionId: input.submissionId,
      score: input.score,
      comment: input.comment ?? null,
    });

    return submission;
  }
}
