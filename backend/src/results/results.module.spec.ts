import { MODULE_METADATA } from '@nestjs/common/constants';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { ResultsController } from './results.controller';
import { ResultsModule } from './results.module';
import { ResultsService } from './results.service';

describe('ResultsModule', () => {
  it('wires imports, controller, provider and export', () => {
    expect(
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, ResultsModule),
    ).toContain(LeaderboardModule);
    expect(
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ResultsModule),
    ).toContain(ResultsController);
    expect(
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ResultsModule),
    ).toContain(ResultsService);
    expect(
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, ResultsModule),
    ).toContain(ResultsService);
  });
});
