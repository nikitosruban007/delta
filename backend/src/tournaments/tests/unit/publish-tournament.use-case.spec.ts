import { PublishTournamentUseCase } from '../../application/use-cases/publish-tournament.use-case';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';

describe('PublishTournamentUseCase', () => {
  it('publishes a draft tournament', async () => {
    const repo = {
      findTournamentById: jest.fn().mockResolvedValue({
        id: 't1',
        organizerId: 'u1',
        status: TournamentStatus.DRAFT,
      }),
      updateTournament: jest.fn().mockResolvedValue({ id: 't1', status: TournamentStatus.REGISTRATION_OPEN }),
    };
    const cache = { set: jest.fn() };
    const notifier = { emitToTournament: jest.fn() };

    const useCase = new PublishTournamentUseCase(repo as any, cache as any, notifier as any);
    const result = await useCase.execute('t1', 'u1');

    expect(result.status).toBe(TournamentStatus.REGISTRATION_OPEN);
  });
});
