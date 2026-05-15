import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TOURNAMENT_REPOSITORY } from '../ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../ports/tournament.repository.port';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';

export interface UpdateDeadlineInput {
  entityType: 'TOURNAMENT' | 'STAGE';
  entityId: string;
  deadlineAt: Date | null;
  organizerId: string;
  organizerIsAdmin: boolean;
}

@Injectable()
export class UpdateDeadlineUseCase {
  constructor(
    @Inject(TOURNAMENT_REPOSITORY)
    private readonly repo: TournamentRepositoryPort,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
  ) {}

  async execute(input: UpdateDeadlineInput) {
    if (input.entityType === 'TOURNAMENT') {
      const tournament = await this.repo.findTournamentById(input.entityId);
      if (!tournament) throw new NotFoundException('Tournament not found');
      if (
        !input.organizerIsAdmin &&
        tournament.organizerId !== input.organizerId
      ) {
        throw new ForbiddenException('You do not own this tournament');
      }
      const updated = await this.repo.updateTournament(input.entityId, {
        registrationDeadline: input.deadlineAt,
      });
      await this.notifier.emitToTournament(
        input.entityId,
        'tournament.deadline.updated',
        updated,
      );
      return updated;
    }

    const stage = await this.repo.findStageById(input.entityId);
    if (!stage) throw new NotFoundException('Stage not found');
    const tournament = await this.repo.findTournamentById(stage.tournamentId);
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (
      !input.organizerIsAdmin &&
      tournament.organizerId !== input.organizerId
    ) {
      throw new ForbiddenException('You do not own this tournament');
    }
    const updated = await this.repo.updateStage(input.entityId, {
      deadlineAt: input.deadlineAt,
    });
    await this.notifier.emitToTournament(
      stage.tournamentId,
      'stage.deadline.updated',
      updated,
    );
    return updated;
  }
}
