import { LeaderboardController } from './leaderboard.controller';

describe('LeaderboardController', () => {
  it('delegates leaderboard requests to the service', () => {
    const service = {
      getLeaderboard: jest.fn().mockReturnValue({ items: [] }),
    };
    const controller = new LeaderboardController(service as any);
    const query = { page: 1, limit: 20 };

    expect(controller.getLeaderboard('4', query)).toEqual({ items: [] });
    expect(service.getLeaderboard).toHaveBeenCalledWith('4', query);
  });
});
