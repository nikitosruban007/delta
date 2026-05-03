import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LeaderboardCacheService } from './leaderboard-cache.service';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [PrismaModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardCacheService],
  exports: [LeaderboardService, LeaderboardCacheService],
})
export class LeaderboardModule {}
