import { ForbiddenException } from '@nestjs/common';
import { TournamentsController } from '../../presentation/controllers/tournaments.controller';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';
import { Tournament } from '../../domain/entities/tournament.entity';

const mockRepo = {
  listTournaments: jest.fn(),
  findTournamentById: jest.fn(),
  createTournament: jest.fn(),
  updateTournament: jest.fn(),
  createStage: jest.fn(),
  updateStage: jest.fn(),
  findStageById: jest.fn(),
  listStagesByTournament: jest.fn(),
  createTeam: jest.fn(),
  findTeamById: jest.fn(),
  findTeamByTournamentAndCaptain: jest.fn(),
  createSubmission: jest.fn(),
  findSubmissionById: jest.fn(),
  findSubmissionByTeamAndStage: jest.fn(),
  updateSubmission: jest.fn(),
  listSubmissionsByTournament: jest.fn(),
  createAnnouncement: jest.fn(),
  createJudgeAssignment: jest.fn(),
  findTournamentTeams: jest.fn(),
};

const mockRegisterTournament = { execute: jest.fn() };
const mockPublishTournament = { execute: jest.fn() };
const mockFinishEvaluation = { execute: jest.fn() };

describe('TournamentsController - access control', () => {
  let controller: TournamentsController;

  beforeEach(() => {
    controller = new TournamentsController(
      mockRegisterTournament as any,
      mockPublishTournament as any,
      mockFinishEvaluation as any,
      mockRepo as any,
    );
    jest.clearAllMocks();
  });

  it('throws ForbiddenException when non-admin/organizer tries to create', async () => {
    const participantUser = { id: '1', email: 'user@test.com', roles: ['PARTICIPANT'], permissions: [] };

    await expect(
      controller.create(participantUser, { title: 'New Tournament' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows ADMIN to create tournament', async () => {
    const adminUser = { id: '1', email: 'admin@test.com', roles: ['ADMIN'], permissions: [] };
    const mockTournament = new Tournament(
      '1', 'Test', null, '1',
      TournamentStatus.DRAFT, null, null, null,
      new Date(), new Date(),
    );
    mockRegisterTournament.execute.mockResolvedValue(mockTournament);

    const result = await controller.create(adminUser, { title: 'Test' } as any);

    expect(result).toBe(mockTournament);
    expect(mockRegisterTournament.execute).toHaveBeenCalledWith(
      expect.objectContaining({ organizerId: '1', title: 'Test' }),
    );
  });

  it('allows ORGANIZER to create tournament', async () => {
    const orgUser = { id: '2', email: 'org@test.com', roles: ['ORGANIZER'], permissions: [] };
    mockRegisterTournament.execute.mockResolvedValue({ id: '1' });

    await controller.create(orgUser, { title: 'Org Tournament' } as any);

    expect(mockRegisterTournament.execute).toHaveBeenCalledWith(
      expect.objectContaining({ organizerId: '2' }),
    );
  });

  it('lists tournaments without auth', async () => {
    mockRepo.listTournaments.mockResolvedValue([]);
    const result = await controller.list();
    expect(result).toEqual([]);
    expect(mockRepo.listTournaments).toHaveBeenCalled();
  });

  it('throws ForbiddenException when JUDGE tries to publish', async () => {
    const judgeUser = { id: '3', email: 'judge@test.com', roles: ['JUDGE'], permissions: [] };

    await expect(
      controller.publish(judgeUser, { tournamentId: '1' }),
    ).rejects.toThrow(ForbiddenException);
  });
});
