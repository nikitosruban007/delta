import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterTeamUseCase } from '../../application/use-cases/register-team.use-case';
import { SubmitWorkUseCase } from '../../application/use-cases/submit-work.use-case';
import { AssignJudgeUseCase } from '../../application/use-cases/assign-judge.use-case';
import { ScoreSubmissionUseCase } from '../../application/use-cases/score-submission.use-case';
import { CreateStageUseCase } from '../../application/use-cases/create-stage.use-case';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';
import { Tournament } from '../../domain/entities/tournament.entity';

function makePrisma(overrides: any = {}) {
  return {
    tournaments: { findUnique: jest.fn(), updateMany: jest.fn() },
    tournament_teams: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    teams: { create: jest.fn() },
    team_members: { create: jest.fn(), upsert: jest.fn(), findFirst: jest.fn() },
    team_invites: { create: jest.fn() },
    users: { findUnique: jest.fn() },
    rounds: { findUnique: jest.fn() },
    submissions: { findFirst: jest.fn(), update: jest.fn(), create: jest.fn(), findUnique: jest.fn() },
    judge_assignments: { findFirst: jest.fn(), create: jest.fn() },
    evaluations: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    evaluation_scores: { deleteMany: jest.fn(), createMany: jest.fn() },
    evaluation_criteria: { findMany: jest.fn() },
    leaderboard_entries: { deleteMany: jest.fn(), createMany: jest.fn() },
    $transaction: async (fn: any) => fn(this),
    ...overrides,
  };
}

const notifier = { emitToTournament: jest.fn(), emitToUser: jest.fn() } as any;
const leaderboardCache = { del: jest.fn(), get: jest.fn(), set: jest.fn() } as any;

describe('Critical flows', () => {
  describe('RegisterTeamUseCase', () => {
    function setupPrisma() {
      const p: any = makePrisma();
      p.$transaction = async (fn: any) => fn(p);
      return p;
    }

    it('rejects when tournament is not in registration status', async () => {
      const prisma = setupPrisma();
      prisma.tournaments.findUnique.mockResolvedValue({
        id: 1,
        status: 'draft',
        max_teams: 10,
        team_size_min: 1,
        team_size_max: 5,
        registration_deadline: null,
        _count: { tournament_teams: 0 },
      });
      const useCase = new RegisterTeamUseCase(prisma, notifier);
      await expect(
        useCase.execute({
          tournamentId: '1',
          captainId: '1',
          captainEmail: 'a@a.com',
          name: 'T',
          members: [],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects when deadline passed', async () => {
      const prisma = setupPrisma();
      prisma.tournaments.findUnique.mockResolvedValue({
        id: 1,
        status: 'registration',
        max_teams: 10,
        team_size_min: 1,
        team_size_max: 5,
        registration_deadline: new Date(Date.now() - 1000),
        _count: { tournament_teams: 0 },
      });
      const useCase = new RegisterTeamUseCase(prisma, notifier);
      await expect(
        useCase.execute({
          tournamentId: '1',
          captainId: '1',
          captainEmail: 'a@a.com',
          name: 'T',
          members: [],
        }),
      ).rejects.toThrow('deadline');
    });

    it('rejects when max_teams reached', async () => {
      const prisma = setupPrisma();
      prisma.tournaments.findUnique.mockResolvedValue({
        id: 1,
        status: 'registration',
        max_teams: 2,
        team_size_min: 1,
        team_size_max: 5,
        registration_deadline: null,
        _count: { tournament_teams: 2 },
      });
      const useCase = new RegisterTeamUseCase(prisma, notifier);
      await expect(
        useCase.execute({
          tournamentId: '1',
          captainId: '1',
          captainEmail: 'a@a.com',
          name: 'T',
          members: [],
        }),
      ).rejects.toThrow('full');
    });

    it('rejects duplicate member emails', async () => {
      const prisma = setupPrisma();
      prisma.tournaments.findUnique.mockResolvedValue({
        id: 1,
        status: 'registration',
        max_teams: 10,
        team_size_min: 1,
        team_size_max: 5,
        registration_deadline: null,
        _count: { tournament_teams: 0 },
      });
      const useCase = new RegisterTeamUseCase(prisma, notifier);
      await expect(
        useCase.execute({
          tournamentId: '1',
          captainId: '1',
          captainEmail: 'a@a.com',
          name: 'T',
          members: [
            { fullName: 'X', email: 'x@x.com' },
            { fullName: 'Y', email: 'x@x.com' },
          ],
        }),
      ).rejects.toThrow('unique');
    });

    it('persists team + members + invites for unknown emails', async () => {
      const prisma = setupPrisma();
      prisma.tournaments.findUnique.mockResolvedValue({
        id: 1,
        status: 'registration',
        max_teams: 10,
        team_size_min: 1,
        team_size_max: 5,
        registration_deadline: null,
        _count: { tournament_teams: 0 },
      });
      prisma.tournament_teams.findFirst.mockResolvedValue(null);
      prisma.teams.create.mockResolvedValue({ id: 11, name: 'T' });
      prisma.users.findUnique.mockResolvedValue(null); // unknown user

      const useCase = new RegisterTeamUseCase(prisma, notifier);
      const result = await useCase.execute({
        tournamentId: '1',
        captainId: '5',
        captainEmail: 'cap@a.com',
        name: 'T',
        members: [{ fullName: 'Other', email: 'other@a.com' }],
      });

      expect(prisma.teams.create).toHaveBeenCalled();
      expect(prisma.tournament_teams.create).toHaveBeenCalled();
      expect(prisma.team_members.create).toHaveBeenCalled(); // captain
      expect(prisma.team_invites.create).toHaveBeenCalled(); // unknown email
      expect(result.id).toBe('11');
    });

    it('rejects duplicate captain registration', async () => {
      const prisma = setupPrisma();
      prisma.tournaments.findUnique.mockResolvedValue({
        id: 1,
        status: 'registration',
        max_teams: 10,
        team_size_min: 1,
        team_size_max: 5,
        registration_deadline: null,
        _count: { tournament_teams: 0 },
      });
      prisma.tournament_teams.findFirst.mockResolvedValue({ id: 99 });
      const useCase = new RegisterTeamUseCase(prisma, notifier);
      await expect(
        useCase.execute({
          tournamentId: '1',
          captainId: '5',
          captainEmail: 'cap@a.com',
          name: 'T',
          members: [],
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('SubmitWorkUseCase', () => {
    it('rejects when round deadline has passed', async () => {
      const prisma = makePrisma();
      prisma.rounds.findUnique.mockResolvedValue({
        id: 1,
        tournament_id: 10,
        deadline_at: new Date(Date.now() - 1000),
        tournaments: { status: 'active' },
      });
      const useCase = new SubmitWorkUseCase(prisma as any, notifier);
      await expect(
        useCase.execute({
          stageId: '1',
          teamId: '1',
          userId: '1',
          githubUrl: 'https://example.com/repo',
        }),
      ).rejects.toThrow('deadline');
    });

    it('upserts (updates existing) when team already submitted', async () => {
      const prisma = makePrisma();
      prisma.rounds.findUnique.mockResolvedValue({
        id: 1,
        tournament_id: 10,
        deadline_at: new Date(Date.now() + 1_000_000),
        tournaments: { status: 'active' },
      });
      prisma.team_members.findFirst.mockResolvedValue({ id: 1 });
      prisma.tournament_teams.findFirst.mockResolvedValue({ id: 1 });
      prisma.submissions.findFirst.mockResolvedValue({ id: 7 });
      prisma.submissions.update.mockResolvedValue({
        id: 7, team_id: 1, round_id: 1, github_url: 'g', video_url: null, live_demo_url: null,
        description: null, status: 'submitted', created_at: new Date(), updated_at: new Date(),
      });

      const useCase = new SubmitWorkUseCase(prisma as any, notifier);
      const r = await useCase.execute({
        stageId: '1',
        teamId: '1',
        userId: '1',
        githubUrl: 'https://example.com/repo',
      });
      expect(prisma.submissions.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 7 } }),
      );
      expect(prisma.submissions.create).not.toHaveBeenCalled();
      expect(r.id).toBe('7');
    });
  });

  describe('AssignJudgeUseCase', () => {
    it('rejects non-owner organizer', async () => {
      const prisma = makePrisma();
      prisma.tournaments.findUnique.mockResolvedValue({ id: 1, created_by: 99 });
      const useCase = new AssignJudgeUseCase(prisma as any, notifier);
      await expect(
        useCase.execute({
          tournamentId: '1',
          judgeId: '5',
          stageId: null,
          organizerId: '7',
          organizerIsAdmin: false,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('ScoreSubmissionUseCase', () => {
    it('rejects unassigned judge', async () => {
      const prisma = makePrisma();
      prisma.submissions.findUnique.mockResolvedValue({
        id: 1, round_id: 1, rounds: { tournament_id: 10 }, teams: { id: 2 },
      });
      prisma.judge_assignments.findFirst.mockResolvedValue(null);
      const useCase = new ScoreSubmissionUseCase(prisma as any, notifier, leaderboardCache);
      await expect(
        useCase.execute({ submissionId: '1', judgeId: '5', score: 50 }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('persists score and rebuilds leaderboard', async () => {
      const prisma = makePrisma();
      prisma.$transaction = async (fn: any) => fn(prisma);
      prisma.submissions.findUnique.mockResolvedValue({
        id: 1, round_id: 1, rounds: { tournament_id: 10 }, teams: { id: 2 },
      });
      prisma.judge_assignments.findFirst.mockResolvedValue({ id: 1 });
      prisma.evaluations.findFirst.mockResolvedValue(null);
      prisma.evaluations.create.mockResolvedValue({ id: 50, total_score: 75 });
      prisma.tournament_teams.findMany.mockResolvedValue([{ team_id: 2 }]);
      prisma.evaluations.findMany.mockResolvedValue([
        { total_score: 75, submissions: { team_id: 2 } },
      ]);
      const useCase = new ScoreSubmissionUseCase(prisma as any, notifier, leaderboardCache);
      const r = await useCase.execute({ submissionId: '1', judgeId: '5', score: 75 });
      expect(r.totalScore).toBe(75);
      expect(prisma.leaderboard_entries.deleteMany).toHaveBeenCalledWith({
        where: { tournament_id: 10 },
      });
      expect(prisma.leaderboard_entries.createMany).toHaveBeenCalled();
      expect(leaderboardCache.del).toHaveBeenCalled();
    });
  });

  describe('CreateStageUseCase ownership', () => {
    it('rejects when organizer does not own tournament', async () => {
      const repo: any = {
        findTournamentById: jest.fn().mockResolvedValue(
          new Tournament(
            '1', 'T', null, 'OWNER',
            TournamentStatus.DRAFT, null, null, null, new Date(), new Date(),
          ),
        ),
        createStage: jest.fn(),
      };
      const useCase = new CreateStageUseCase(repo, notifier);
      await expect(
        useCase.execute({
          tournamentId: '1',
          title: 'Stage',
          orderIndex: 1,
          organizerId: 'INTRUDER',
          organizerIsAdmin: false,
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects when tournament missing', async () => {
      const repo: any = { findTournamentById: jest.fn().mockResolvedValue(null), createStage: jest.fn() };
      const useCase = new CreateStageUseCase(repo, notifier);
      await expect(
        useCase.execute({
          tournamentId: '1',
          title: 'Stage',
          orderIndex: 1,
          organizerId: 'X',
          organizerIsAdmin: false,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
