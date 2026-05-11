import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('tournaments/:id/leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get user-based tournament leaderboard (legacy results table)' })
  getLeaderboard(@Param('id') id: string, @Query() query: LeaderboardQueryDto) {
    return this.leaderboardService.getLeaderboard(id, query);
  }

  @Get('teams')
  @ApiOperation({ summary: 'Get team-based tournament leaderboard (built from evaluations)' })
  getTeamLeaderboard(@Param('id') id: string) {
    return this.leaderboardService.getTeamLeaderboard(id);
  }
}
