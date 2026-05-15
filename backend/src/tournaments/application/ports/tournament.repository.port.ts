import { Tournament } from '../../domain/entities/tournament.entity';
import { Stage } from '../../domain/entities/stage.entity';
import { Team } from '../../domain/entities/team.entity';
import { Submission } from '../../domain/entities/submission.entity';
import { Announcement } from '../../domain/entities/announcement.entity';
import { JudgeAssignment } from '../../domain/entities/judge-assignment.entity';

export const TOURNAMENT_REPOSITORY = Symbol('TOURNAMENT_REPOSITORY');

export interface SubmissionWithEvaluation {
  id: string;
  teamId: string;
  teamName: string;
  stageId: string;
  stageName: string;
  tournamentId: string;
  tournamentTitle: string;
  githubUrl: string | null;
  videoUrl: string | null;
  liveDemoUrl: string | null;
  description: string | null;
  status: string;
  createdAt: Date;
  evaluation: { id: number; totalScore: number; comment: string | null } | null;
}

export interface TournamentRepositoryPort {
  createTournament(data: Partial<Tournament>): Promise<Tournament>;
  updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament>;
  findTournamentById(id: string): Promise<Tournament | null>;
  listTournaments(status?: string): Promise<Tournament[]>;
  createStage(data: Partial<Stage>): Promise<Stage>;
  updateStage(id: string, data: Partial<Stage>): Promise<Stage>;
  findStageById(id: string): Promise<Stage | null>;
  listStagesByTournament(tournamentId: string): Promise<Stage[]>;
  createTeam(data: Partial<Team>): Promise<Team>;
  findTeamById(id: string): Promise<Team | null>;
  findTeamByTournamentAndCaptain(
    tournamentId: string,
    captainId: string,
  ): Promise<Team | null>;
  isTeamMember(teamId: string, userId: string): Promise<boolean>;
  createSubmission(
    data: Partial<Submission> & {
      videoUrl?: string | null;
      liveDemoUrl?: string | null;
      description?: string | null;
    },
  ): Promise<Submission>;
  findSubmissionById(id: string): Promise<Submission | null>;
  findSubmissionByTeamAndStage(
    teamId: string,
    stageId: string,
  ): Promise<Submission | null>;
  updateSubmission(id: string, data: Partial<Submission>): Promise<Submission>;
  listSubmissionsByTournament(tournamentId: string): Promise<Submission[]>;
  listSubmissionsForJudge(judgeId: string): Promise<SubmissionWithEvaluation[]>;
  createAnnouncement(data: Partial<Announcement>): Promise<Announcement>;
  createJudgeAssignment(
    data: Partial<JudgeAssignment>,
  ): Promise<JudgeAssignment>;
  findTournamentTeams(tournamentId: string): Promise<Team[]>;
}
