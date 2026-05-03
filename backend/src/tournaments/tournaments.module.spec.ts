import { MODULE_METADATA } from '@nestjs/common/constants';
import * as tournaments from './index';
import { CACHE_PORT } from './application/ports/cache.port';
import { NOTIFICATION_PORT } from './application/ports/notification.port';
import { TOURNAMENT_REPOSITORY } from './application/ports/tournament.repository.port';
import { AssignJudgeUseCase } from './application/use-cases/assign-judge.use-case';
import { CreateAnnouncementUseCase } from './application/use-cases/create-announcement.use-case';
import { CreateStageUseCase } from './application/use-cases/create-stage.use-case';
import { PublishTournamentUseCase } from './application/use-cases/publish-tournament.use-case';
import { RegisterTeamUseCase } from './application/use-cases/register-team.use-case';
import { RegisterTournamentUseCase } from './application/use-cases/register-tournament.use-case';
import { ScoreSubmissionUseCase } from './application/use-cases/score-submission.use-case';
import { SubmitWorkUseCase } from './application/use-cases/submit-work.use-case';
import { UpdateDeadlineUseCase } from './application/use-cases/update-deadline.use-case';
import { ApplicationStatus } from './domain/enums/application-status.enum';
import { ScoreStatus } from './domain/enums/score-status.enum';
import { StageStatus } from './domain/enums/stage-status.enum';
import { TeamStatus } from './domain/enums/team-status.enum';
import { TournamentRole } from './domain/enums/role.enum';
import { TournamentStatus } from './domain/enums/tournament-status.enum';
import { AnnouncementsController } from './presentation/controllers/announcements.controller';
import { JudgesController } from './presentation/controllers/judges.controller';
import { StagesController } from './presentation/controllers/stages.controller';
import { SubmissionsController } from './presentation/controllers/submissions.controller';
import { TeamsController } from './presentation/controllers/teams.controller';
import { TournamentsController } from './presentation/controllers/tournaments.controller';
import { TournamentsModule } from './tournaments.module';

describe('TournamentsModule and barrel exports', () => {
  it('wires controllers, providers and repository export', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, TournamentsModule)).toEqual(
      expect.arrayContaining([
        TournamentsController,
        StagesController,
        TeamsController,
        SubmissionsController,
        AnnouncementsController,
        JudgesController,
      ]),
    );
    expect(Reflect.getMetadata(MODULE_METADATA.PROVIDERS, TournamentsModule)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: TOURNAMENT_REPOSITORY }),
        expect.objectContaining({ provide: CACHE_PORT }),
        expect.objectContaining({ provide: NOTIFICATION_PORT }),
        RegisterTournamentUseCase,
        PublishTournamentUseCase,
        CreateStageUseCase,
        UpdateDeadlineUseCase,
        RegisterTeamUseCase,
        SubmitWorkUseCase,
        CreateAnnouncementUseCase,
        AssignJudgeUseCase,
        ScoreSubmissionUseCase,
      ]),
    );
    expect(Reflect.getMetadata(MODULE_METADATA.EXPORTS, TournamentsModule)).toContain(
      TOURNAMENT_REPOSITORY,
    );
  });

  it('exports tournament public API from index.ts', () => {
    expect(tournaments.TournamentsModule).toBe(TournamentsModule);
    expect(tournaments.TournamentStatus).toBe(TournamentStatus);
    expect(tournaments.StageStatus).toBe(StageStatus);
    expect(tournaments.TeamStatus).toBe(TeamStatus);
    expect(tournaments.ApplicationStatus).toBe(ApplicationStatus);
    expect(tournaments.ScoreStatus).toBe(ScoreStatus);
    expect(tournaments.TournamentRole).toBe(TournamentRole);
  });
});
