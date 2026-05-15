import { RegisterTournamentUseCase } from '../../application/use-cases/register-tournament.use-case';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';

describe('RegisterTournamentUseCase', () => {
  it('creates a tournament in draft status', async () => {
    const repo = {
      createTournament: jest
        .fn()
        .mockResolvedValue({ id: '1', status: TournamentStatus.DRAFT }),
    };
    const cache = { set: jest.fn() };
    const notifier = { emitToUser: jest.fn() };

    const useCase = new RegisterTournamentUseCase(
      repo as any,
      cache as any,
      notifier as any,
    );
    const result = await useCase.execute({ organizerId: 'u1', title: 'Test' });

    expect(repo.createTournament).toHaveBeenCalled();
    expect(result.id).toBe('1');
  });
});
