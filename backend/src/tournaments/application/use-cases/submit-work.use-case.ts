import { Inject, Injectable } from '@nestjs/common';
import { TournamentRepositoryPort, TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import { NotificationPort, NOTIFICATION_PORT } from '../ports/notification.port';
import { ScoreStatus } from '../../domain/enums/score-status.enum';

export interface SubmitWorkInput {
  stageId: string;
  teamId: string;
  title: string;
  contentUrl?: string | null;
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
      title: input.title,
      contentUrl: input.contentUrl ?? null,
      status: ScoreStatus.SUBMITTED,
    });

    await this.notifier.emitToTournament(input.stageId, 'submission.created', submission);
    return submission;
  }
}
