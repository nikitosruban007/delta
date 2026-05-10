import { Inject, Injectable } from '@nestjs/common';
import { TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../ports/tournament.repository.port';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';
import { ScoreStatus } from '../../domain/enums/score-status.enum';

export interface SubmitWorkInput {
  stageId: string;
  teamId: string;
  contentUrl?: string | null;
  videoUrl?: string | null;
  liveDemoUrl?: string | null;
  description?: string | null;
}

@Injectable()
export class SubmitWorkUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: SubmitWorkInput) {
    const submission = await this.repo.createSubmission({
      stageId: input.stageId,
      teamId: input.teamId,
      contentUrl: input.contentUrl ?? null,
      videoUrl: input.videoUrl ?? null,
      liveDemoUrl: input.liveDemoUrl ?? null,
      description: input.description ?? null,
      status: ScoreStatus.SUBMITTED,
    });

    await this.notifier.emitToTournament(input.stageId, 'submission.created', submission);
    return submission;
  }
}
