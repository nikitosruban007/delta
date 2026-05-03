import { Injectable } from '@nestjs/common';

@Injectable()
export class TournamentEventService {
  buildTournamentCacheKey(tournamentId: string) {
    return `tournaments:${tournamentId}`;
  }

  buildStageCacheKey(stageId: string) {
    return `stages:${stageId}`;
  }
}
