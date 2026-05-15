import { MODULE_METADATA } from '@nestjs/common/constants';
import { LeaderboardCacheService } from './leaderboard-cache.service';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardModule } from './leaderboard.module';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardModule', () => {
  it('wires controller, providers and exports', () => {
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, LeaderboardModule),
    ).toContain(LeaderboardController);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, LeaderboardModule),
    ).toEqual(
      expect.arrayContaining([LeaderboardService, LeaderboardCacheService]),
    );
    expect(
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, LeaderboardModule),
    ).toEqual(
      expect.arrayContaining([LeaderboardService, LeaderboardCacheService]),
    );
  });
});
