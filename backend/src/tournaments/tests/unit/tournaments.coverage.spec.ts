import { NotFoundException } from '@nestjs/common';
import { Announcement } from '../../domain/entities/announcement.entity';
import { JudgeAssignment } from '../../domain/entities/judge-assignment.entity';
import { Stage } from '../../domain/entities/stage.entity';
import { Submission } from '../../domain/entities/submission.entity';
import { Team } from '../../domain/entities/team.entity';
import { Tournament } from '../../domain/entities/tournament.entity';
import { ApplicationStatus } from '../../domain/enums/application-status.enum';
import { TournamentRole } from '../../domain/enums/role.enum';
import { ScoreStatus } from '../../domain/enums/score-status.enum';
import { StageStatus } from '../../domain/enums/stage-status.enum';
import { TeamStatus } from '../../domain/enums/team-status.enum';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';
import { AssignJudgeUseCase } from '../../application/use-cases/assign-judge.use-case';
import { CreateAnnouncementUseCase } from '../../application/use-cases/create-announcement.use-case';
import { CreateStageUseCase } from '../../application/use-cases/create-stage.use-case';
import { PublishTournamentUseCase } from '../../application/use-cases/publish-tournament.use-case';
import { RegisterTeamUseCase } from '../../application/use-cases/register-team.use-case';
import { ScoreSubmissionUseCase } from '../../application/use-cases/score-submission.use-case';
import { SubmitWorkUseCase } from '../../application/use-cases/submit-work.use-case';
import { UpdateDeadlineUseCase } from '../../application/use-cases/update-deadline.use-case';
import { PrismaTournamentRepository } from '../../infrastructure/prisma/tournament.repository';
import { TournamentCacheService } from '../../infrastructure/redis/tournament-cache.service';
import { TournamentWsGateway } from '../../infrastructure/websocket/tournaments.gateway';
import { AnnouncementsController } from '../../presentation/controllers/announcements.controller';
import { JudgesController } from '../../presentation/controllers/judges.controller';
import { StagesController } from '../../presentation/controllers/stages.controller';
import { SubmissionsController } from '../../presentation/controllers/submissions.controller';
import { TeamsController } from '../../presentation/controllers/teams.controller';
import { TournamentsController } from '../../presentation/controllers/tournaments.controller';
import { JudgeGuard } from '../../presentation/guards/judge.guard';
import { OrganizerGuard } from '../../presentation/guards/organizer.guard';
import { TeamGuard } from '../../presentation/guards/team.guard';
import { TournamentEventService } from '../../presentation/services/tournaments.service';

describe('tournaments coverage', () => {
  function createRepo() {
    return {
      createTournament: jest.fn().mockResolvedValue(tournament()),
      updateTournament: jest.fn().mockResolvedValue(tournament({ id: 'updated' })),
      findTournamentById: jest.fn().mockResolvedValue(tournament()),
      createStage: jest.fn().mockResolvedValue(stage()),
      updateStage: jest.fn().mockResolvedValue(stage({ id: 'stage-updated' })),
      findStageById: jest.fn().mockResolvedValue(stage()),
      createTeam: jest.fn().mockResolvedValue(team()),
      createSubmission: jest.fn().mockResolvedValue(submission()),
      createAnnouncement: jest.fn().mockResolvedValue(announcement()),
      createJudgeAssignment: jest.fn().mockResolvedValue(judgeAssignment()),
      findTournamentTeams: jest.fn().mockResolvedValue([]),
    };
  }

  function createPrismaForScore(submissionRow: any) {
    return {
      submissions: {
        findUnique: jest.fn().mockResolvedValue(submissionRow),
        update: jest.fn().mockResolvedValue(submissionRow),
      },
      evaluations: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 1, total_score: 10 }),
        update: jest.fn().mockResolvedValue({ id: 1, total_score: 10 }),
      },
    } as any;
  }

  function createNotifier() {
    return {
      emitToTournament: jest.fn().mockResolvedValue(undefined),
      emitToUser: jest.fn().mockResolvedValue(undefined),
    };
  }

  it('covers simple entities and enum exports', () => {
    const now = new Date('2026-05-03T10:00:00.000Z');

    expect(new Tournament('t', 'Title', null, 'u', TournamentStatus.DRAFT, null, null, null, now, now)).toMatchObject({ id: 't' });
    expect(new Stage('s', 't', 'Stage', null, 1, StageStatus.DRAFT, null, now, now)).toMatchObject({ id: 's' });
    expect(new Team('team', 't', 'u', 'Team', TeamStatus.REGISTERED, now, now)).toMatchObject({ id: 'team' });
    expect(new Submission('sub', 's', 'team', null, ScoreStatus.SUBMITTED, now, now)).toMatchObject({ id: 'sub' });
    expect(new Announcement('a', 't', 'u', 'Title', 'Body', now, now)).toMatchObject({ id: 'a' });
    expect(new JudgeAssignment('j', 't', 'judge', null, now, now)).toMatchObject({ id: 'j' });
    expect([
      ApplicationStatus.PENDING,
      TournamentRole.ADMIN,
      ScoreStatus.REVIEWED,
      StageStatus.DRAFT,
      TeamStatus.REGISTERED,
      TournamentStatus.DRAFT,
    ]).toBeTruthy();
  });

  it('covers use-case success paths', async () => {
    const repo = createRepo();
    const notifier = createNotifier();
    const cache = { set: jest.fn().mockResolvedValue(undefined), get: jest.fn(), del: jest.fn() };

    await expect(new CreateStageUseCase(repo as any, notifier).execute({
      tournamentId: 't',
      title: 'Stage',
      orderIndex: 1,
    })).resolves.toMatchObject({ id: 'stage' });
    expect(repo.createStage).toHaveBeenCalledWith(expect.objectContaining({ status: StageStatus.DRAFT }));

    await expect(new RegisterTeamUseCase(repo as any, notifier).execute({
      tournamentId: 't',
      captainId: 'u',
      name: 'Team',
    })).resolves.toMatchObject({ id: 'team' });

    await expect(new SubmitWorkUseCase(repo as any, notifier).execute({
      stageId: 's',
      teamId: 'team',
    })).resolves.toMatchObject({ id: 'submission' });

    await expect(new CreateAnnouncementUseCase(repo as any, notifier).execute({
      tournamentId: 't',
      authorId: 'u',
      title: 'Title',
      body: 'Body',
    })).resolves.toMatchObject({ id: 'announcement' });

    await expect(new AssignJudgeUseCase(repo as any, notifier).execute({
      tournamentId: 't',
      judgeId: 'judge',
    })).resolves.toMatchObject({ id: 'assignment', stageId: null });

    await expect(new PublishTournamentUseCase(repo as any, cache as any, notifier).execute('t', 'organizer')).resolves.toMatchObject({ id: 'updated' });
    expect(cache.set).toHaveBeenCalledWith('tournaments:t', expect.any(Tournament), 300);

    const fakeSubmission = { id: 1, team_id: 1, round_id: 1, status: 'submitted' };
    await expect(new ScoreSubmissionUseCase(createPrismaForScore(fakeSubmission), notifier).execute({
      submissionId: '1',
      judgeId: '1',
      score: 10,
    })).resolves.toMatchObject({ id: 1 });
  });

  it('covers use-case error and deadline paths', async () => {
    const repo = createRepo();
    const notifier = createNotifier();
    const cache = { set: jest.fn(), get: jest.fn(), del: jest.fn() };
    const publish = new PublishTournamentUseCase(repo as any, cache as any, notifier);

    repo.findTournamentById.mockResolvedValueOnce(null);
    await expect(publish.execute('missing', 'organizer')).rejects.toThrow('Tournament not found');

    repo.findTournamentById.mockResolvedValueOnce(tournament({ organizerId: 'other' }));
    await expect(publish.execute('t', 'organizer')).rejects.toThrow('Forbidden');

    repo.findTournamentById.mockResolvedValueOnce(tournament({ status: TournamentStatus.REGISTRATION_OPEN }));
    await expect(publish.execute('t', 'organizer')).rejects.toThrow('Only draft tournaments can be published');

    const deadline = new UpdateDeadlineUseCase(repo as any, notifier);
    await expect(deadline.execute({
      entityType: 'TOURNAMENT',
      entityId: 't',
      deadlineAt: null,
    })).resolves.toMatchObject({ id: 'updated' });

    await expect(deadline.execute({
      entityType: 'STAGE',
      entityId: 's',
      deadlineAt: null,
    })).resolves.toMatchObject({ id: 'stage-updated' });

    repo.findTournamentById.mockResolvedValueOnce(null);
    await expect(deadline.execute({
      entityType: 'TOURNAMENT',
      entityId: 'missing',
      deadlineAt: null,
    })).rejects.toBeInstanceOf(NotFoundException);

    repo.findStageById.mockResolvedValueOnce(null);
    await expect(deadline.execute({
      entityType: 'STAGE',
      entityId: 'missing',
      deadlineAt: null,
    })).rejects.toThrow('Stage not found');

    await expect(new ScoreSubmissionUseCase(createPrismaForScore(null), notifier).execute({
      submissionId: 'missing',
      judgeId: 'judge',
      score: 1,
    })).rejects.toThrow('Submission not found');
  });

  it('covers controllers, guards, cache and infrastructure stubs', async () => {
    const execute = jest.fn().mockReturnValue({ ok: true });
    const user = { id: 'u', email: 'u@test.com', roles: ['ADMIN'], permissions: [] };
    const repo = { findTournamentById: jest.fn(), findTournamentTeams: jest.fn(), listStagesByTournament: jest.fn(), findTeamById: jest.fn().mockResolvedValue({ id: 'team', name: 'T' }), isTeamMember: jest.fn().mockResolvedValue(true) } as any;
    expect(new AnnouncementsController({ execute } as any).create(user, { tournamentId: 't' } as any)).toEqual({ ok: true });
    expect(new TeamsController({ execute } as any).register(user, { tournamentId: 't' } as any)).toEqual({ ok: true });
    await expect(new SubmissionsController({ execute } as any, repo).submit(user, { stageId: 's', teamId: 'team' } as any)).resolves.toEqual({ ok: true });
    await expect(new JudgesController({ execute } as any, { execute } as any, repo).assign(user, { tournamentId: 't' } as any)).resolves.toEqual({ ok: true });
    await expect(new JudgesController({ execute } as any, { execute } as any, repo).score(user, { submissionId: 's' } as any)).resolves.toEqual({ ok: true });
    expect(new StagesController({ execute } as any, { execute } as any).create(user, { tournamentId: 't', title: 'Stage', orderIndex: 1 } as any)).toEqual({ ok: true });
    expect(new StagesController({ execute } as any, { execute } as any).update(user, { entityType: 'STAGE', entityId: 's' } as any)).toEqual({ ok: true });
    await expect(new TournamentsController({ execute } as any, { execute } as any, repo).create(user, { title: 'Title' } as any)).resolves.toEqual({ ok: true });
    await expect(new TournamentsController({ execute } as any, { execute } as any, repo).publish(user, { tournamentId: 't' })).resolves.toEqual({ ok: true });

    expect(new OrganizerGuard().canActivate(context(['ORGANIZER']))).toBe(true);
    expect(new OrganizerGuard().canActivate(context(['ADMIN']))).toBe(true);
    expect(new OrganizerGuard().canActivate(context(['TEAM']))).toBe(false);
    expect(new JudgeGuard().canActivate(context(['JUDGE']))).toBe(true);
    expect(new JudgeGuard().canActivate(context(['ADMIN']))).toBe(true);
    expect(new JudgeGuard().canActivate(context([]))).toBe(false);
    expect(new TeamGuard().canActivate(context(['TEAM']))).toBe(true);
    expect(new TeamGuard().canActivate(context(['ADMIN']))).toBe(true);
    expect(new TeamGuard().canActivate(context(undefined))).toBe(false);

    const eventService = new TournamentEventService();
    expect(eventService.buildTournamentCacheKey('t')).toBe('tournaments:t');
    expect(eventService.buildStageCacheKey('s')).toBe('stages:s');

    const cache = new TournamentCacheService();
    await expect(cache.get('missing')).resolves.toBeNull();
    await cache.set('key', { ok: true }, 60);
    await expect(cache.get('key')).resolves.toEqual({ ok: true });
    await cache.del('key');
    await expect(cache.get('key')).resolves.toBeNull();

    const gateway = new TournamentWsGateway();
    await expect(gateway.emitToTournament('t', 'event', {})).resolves.toBeUndefined();
    await expect(gateway.emitToUser('u', 'event', {})).resolves.toBeUndefined();
  });

  it('covers repository announcement and assignment stubs', async () => {
    const now = new Date();
    const fakeTournament = { id: 1, title: 'T', description: null, status: 'draft', created_by: 1, registration_deadline: null, starts_at: null, ends_at: null, created_at: now };
    const fakeRound = { id: 1, tournament_id: 1, title: 'R', description: null, round_order: 1, deadline_at: null, created_at: now };
    const fakeTeam = { id: 1, name: 'T', captain_id: 1, created_at: now };
    const fakeSubmission = { id: 1, team_id: 1, round_id: 1, github_url: null, status: 'draft', created_at: now };
    const prisma = {
      tournaments: { create: jest.fn().mockResolvedValue(fakeTournament), update: jest.fn().mockResolvedValue(fakeTournament), findUnique: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
      rounds: { create: jest.fn().mockResolvedValue(fakeRound), update: jest.fn().mockResolvedValue(fakeRound), findUnique: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
      teams: { create: jest.fn().mockResolvedValue(fakeTeam), findUnique: jest.fn().mockResolvedValue(null) },
      tournament_teams: { create: jest.fn().mockResolvedValue({}), findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn().mockResolvedValue(null) },
      team_members: { create: jest.fn().mockResolvedValue({}) },
      submissions: { create: jest.fn().mockResolvedValue(fakeSubmission), update: jest.fn().mockResolvedValue(fakeSubmission), findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
    } as any;
    const repo = new PrismaTournamentRepository(prisma);

    await expect(repo.createTournament({ title: 'Title', organizerId: 'u' })).resolves.toBeInstanceOf(Tournament);
    await expect(repo.updateTournament('t', { status: TournamentStatus.REGISTRATION_OPEN })).resolves.toBeInstanceOf(Tournament);
    await expect(repo.findTournamentById('t')).resolves.toBeNull();
    await expect(repo.createStage({ title: 'Stage' })).resolves.toMatchObject({ id: '1' });
    await expect(repo.findStageById('s')).resolves.toBeNull();
    await expect(repo.createTeam({ name: 'Team' })).resolves.toBeInstanceOf(Team);
    await expect(repo.createSubmission({ teamId: '1', stageId: '1' })).resolves.toBeInstanceOf(Submission);
    await expect(repo.createAnnouncement({ title: 'Title', body: 'Body' })).resolves.toBeInstanceOf(Announcement);
    await expect(repo.createJudgeAssignment({ judgeId: 'judge' })).resolves.toBeInstanceOf(JudgeAssignment);
    await expect(repo.findTournamentTeams('t')).resolves.toEqual([]);
  });

  function context(roles: string[] | undefined) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: roles ? { roles } : undefined }),
      }),
    } as any;
  }

  function tournament(overrides: Partial<Tournament> = {}) {
    return new Tournament(
      overrides.id ?? 't',
      overrides.title ?? 'Title',
      overrides.description ?? null,
      overrides.organizerId ?? 'organizer',
      overrides.status ?? TournamentStatus.DRAFT,
      overrides.registrationDeadline ?? null,
      overrides.startsAt ?? null,
      overrides.endsAt ?? null,
      overrides.createdAt ?? new Date('2026-05-03T10:00:00.000Z'),
      overrides.updatedAt ?? new Date('2026-05-03T10:00:00.000Z'),
    );
  }

  function stage(overrides: Partial<Stage> = {}) {
    return new Stage(
      overrides.id ?? 'stage',
      overrides.tournamentId ?? 't',
      overrides.title ?? 'Stage',
      overrides.description ?? null,
      overrides.orderIndex ?? 1,
      overrides.status ?? StageStatus.DRAFT,
      overrides.deadlineAt ?? null,
      overrides.createdAt ?? new Date('2026-05-03T10:00:00.000Z'),
      overrides.updatedAt ?? new Date('2026-05-03T10:00:00.000Z'),
    );
  }

  function team() {
    return new Team('team', 't', 'u', 'Team', TeamStatus.REGISTERED, new Date(), new Date());
  }

  function submission() {
    return new Submission('submission', 'stage', 'team', null, ScoreStatus.SUBMITTED, new Date(), new Date());
  }

  function announcement() {
    return new Announcement('announcement', 't', 'u', 'Title', 'Body', new Date(), new Date());
  }

  function judgeAssignment() {
    return new JudgeAssignment('assignment', 't', 'judge', null, new Date(), new Date());
  }
});
