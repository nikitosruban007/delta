import { Module } from '@nestjs/common';
import { TournamentsController } from './presentation/controllers/tournaments.controller';
import { StagesController } from './presentation/controllers/stages.controller';
import { TeamsController } from './presentation/controllers/teams.controller';
import { SubmissionsController } from './presentation/controllers/submissions.controller';
import { AnnouncementsController } from './presentation/controllers/announcements.controller';
import { JudgesController } from './presentation/controllers/judges.controller';
import { TournamentWsGateway } from './infrastructure/websocket/tournaments.gateway';
import { PrismaTournamentRepository } from './infrastructure/prisma/tournament.repository';
import { TournamentCacheService } from './infrastructure/redis/tournament-cache.service';
import { TournamentEventService } from './presentation/services/tournaments.service';

import { RegisterTournamentUseCase } from './application/use-cases/register-tournament.use-case';
import { PublishTournamentUseCase } from './application/use-cases/publish-tournament.use-case';
import { CreateStageUseCase } from './application/use-cases/create-stage.use-case';
import { UpdateDeadlineUseCase } from './application/use-cases/update-deadline.use-case';
import { RegisterTeamUseCase } from './application/use-cases/register-team.use-case';
import { SubmitWorkUseCase } from './application/use-cases/submit-work.use-case';
import { CreateAnnouncementUseCase } from './application/use-cases/create-announcement.use-case';
import { AssignJudgeUseCase } from './application/use-cases/assign-judge.use-case';
import { ScoreSubmissionUseCase } from './application/use-cases/score-submission.use-case';

import { TOURNAMENT_REPOSITORY } from './application/ports/tournament.repository.port';
import { CACHE_PORT } from './application/ports/cache.port';
import { NOTIFICATION_PORT } from './application/ports/notification.port';

@Module({
  controllers: [
    TournamentsController,
    StagesController,
    TeamsController,
    SubmissionsController,
    AnnouncementsController,
    JudgesController,
  ],
  providers: [
    // ports
    { provide: TOURNAMENT_REPOSITORY, useClass: PrismaTournamentRepository },
    { provide: CACHE_PORT, useClass: TournamentCacheService },
    { provide: NOTIFICATION_PORT, useClass: TournamentWsGateway },

    // use cases
    RegisterTournamentUseCase,
    PublishTournamentUseCase,
    CreateStageUseCase,
    UpdateDeadlineUseCase,
    RegisterTeamUseCase,
    SubmitWorkUseCase,
    CreateAnnouncementUseCase,
    AssignJudgeUseCase,
    ScoreSubmissionUseCase,

    // façade/service
    TournamentEventService,
  ],
  exports: [TOURNAMENT_REPOSITORY],
})
export class TournamentsModule {}
