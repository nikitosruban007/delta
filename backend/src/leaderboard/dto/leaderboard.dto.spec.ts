import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { LeaderboardQueryDto } from './leaderboard-query.dto';

describe('LeaderboardQueryDto', () => {
  it('transforms and validates query input', () => {
    const dto = plainToInstance(LeaderboardQueryDto, {
      page: '2',
      limit: '50',
      sortBy: 'wins',
      order: 'asc',
    });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto).toMatchObject({
      page: 2,
      limit: 50,
      sortBy: 'wins',
      order: 'asc',
    });
  });

  it('rejects invalid query input', () => {
    const dto = plainToInstance(LeaderboardQueryDto, {
      page: '0',
      limit: '101',
      sortBy: 'bad',
      order: 'sideways',
    });

    expect(validateSync(dto).map((error) => error.property)).toEqual([
      'page',
      'limit',
      'sortBy',
      'order',
    ]);
  });
});
