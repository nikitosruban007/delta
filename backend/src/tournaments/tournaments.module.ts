import { Module } from '@nestjs/common';
import { TournamentsController } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/presentation/controllers/tournaments.controller';
import { StagesController } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/presentation/controllers/stages.controller';
import { TeamsController } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/presentation/controllers/teams.controller';
import { SubmissionsController } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/presentation/controllers/submissions.controller';
import { AnnouncementsController } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/presentation/controllers/announcements.controller';
import { JudgesController } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/presentation/controllers/judges.controller';
import { TournamentWsGateway } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/infrastructure/websocket/tournaments.gateway';
import { PrismaTournamentRepository } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/infrastructure/prisma/tournament.repository';
import { TournamentCacheService } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/infrastructure/redis/tournament-cache.service';
import { TournamentEventService } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/presentation/services/tournaments.service';

import { RegisterTournamentUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/register-tournament.use-case';
import { PublishTournamentUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/publish-tournament.use-case';
import { CreateStageUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/create-stage.use-case';
import { UpdateDeadlineUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/update-deadline.use-case';
import { RegisterTeamUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/register-team.use-case';
import { SubmitWorkUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/submit-work.use-case';
import { CreateAnnouncementUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/create-announcement.use-case';
import { AssignJudgeUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/assign-judge.use-case';
import { ScoreSubmissionUseCase } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/use-cases/score-submission.use-case';

import { TOURNAMENT_REPOSITORY } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/ports/tournament.repository.port';
import { CACHE_PORT } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/ports/cache.port';
import { NOTIFICATION_PORT } from '../../../../../../Downloads/tournaments_src_tournaments_full/src/tournaments/application/ports/notification.port';

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
