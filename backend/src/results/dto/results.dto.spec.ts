import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateResultDto } from './create-result.dto';
import { ListResultsQueryDto } from './list-results-query.dto';

describe('results DTOs', () => {
  it('transforms and validates create result input', () => {
    const dto = plainToInstance(CreateResultDto, {
      userId: '7',
      score: '42.5',
      wins: '3',
      timeMs: '1200',
    });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto).toMatchObject({
      userId: 7,
      score: 42.5,
      wins: 3,
      timeMs: 1200,
    });
  });

  it('rejects invalid create result input', () => {
    const dto = plainToInstance(CreateResultDto, {
      userId: '0',
      score: '-1',
      wins: '-2',
      timeMs: '-3',
    });

    expect(validateSync(dto).map((error) => error.property)).toEqual([
      'userId',
      'score',
      'wins',
      'timeMs',
    ]);
  });

  it('transforms and validates list query input', () => {
    const dto = plainToInstance(ListResultsQueryDto, {
      page: '2',
      limit: '50',
    });

    expect(validateSync(dto)).toHaveLength(0);
    expect(dto).toMatchObject({ page: 2, limit: 50 });
  });
});
