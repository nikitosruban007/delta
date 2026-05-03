import { Inject, Injectable } from '@nestjs/common';
import { TournamentRepositoryPort, TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import { StageStatus } from '../../domain/enums/stage-status.enum';
import { NotificationPort, NOTIFICATION_PORT } from '../ports/notification.port';

export interface CreateStageInput {
  tournamentId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  deadlineAt?: Date | null;
}

@Injectable()
export class CreateStageUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: CreateStageInput) {
    const stage = await this.repo.createStage({
      tournamentId: input.tournamentId,
      title: input.title,
      description: input.description ?? null,
      orderIndex: input.orderIndex,
      deadlineAt: input.deadlineAt ?? null,
      status: StageStatus.DRAFT,
    });

    await this.notifier.emitToTournament(input.tournamentId, 'stage.created', stage);
    return stage;
  }
}
