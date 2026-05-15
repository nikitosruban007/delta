import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../ports/tournament.repository.port';
import { StageStatus } from '../../domain/enums/stage-status.enum';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';

export interface CreateStageInput {
  tournamentId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  deadlineAt?: Date | null;
  organizerId: string;
  organizerIsAdmin: boolean;
}

@Injectable()
export class CreateStageUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY)
    private readonly repo: TournamentRepositoryPort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: CreateStageInput) {
    const tournament = await this.repo.findTournamentById(input.tournamentId);
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (
      !input.organizerIsAdmin &&
      tournament.organizerId !== input.organizerId
    ) {
      throw new ForbiddenException('You do not own this tournament');
    }

    const stage = await this.repo.createStage({
      tournamentId: input.tournamentId,
      title: input.title,
      description: input.description ?? null,
      orderIndex: input.orderIndex,
      deadlineAt: input.deadlineAt ?? null,
      status: StageStatus.DRAFT,
    });

    await this.notifier.emitToTournament(
      input.tournamentId,
      'stage.created',
      stage,
    );
    return stage;
  }
}
