import { Inject, Injectable } from '@nestjs/common';
import { TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../ports/tournament.repository.port';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';

export interface AssignJudgeInput {
  tournamentId: string;
  judgeId: string;
  stageId?: string | null;
}

@Injectable()
export class AssignJudgeUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: AssignJudgeInput) {
    const assignment = await this.repo.createJudgeAssignment({
      tournamentId: input.tournamentId,
      judgeId: input.judgeId,
      stageId: input.stageId ?? null,
    });

    await this.notifier.emitToUser(input.judgeId, 'judge.assigned', assignment);
    return assignment;
  }
}
