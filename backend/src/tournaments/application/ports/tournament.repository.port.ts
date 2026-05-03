import { Tournament } from '../../domain/entities/tournament.entity';
import { Stage } from '../../domain/entities/stage.entity';
import { Team } from '../../domain/entities/team.entity';
import { Submission } from '../../domain/entities/submission.entity';
import { Announcement } from '../../domain/entities/announcement.entity';
import { JudgeAssignment } from '../../domain/entities/judge-assignment.entity';

export const TOURNAMENT_REPOSITORY = Symbol('TOURNAMENT_REPOSITORY');

export interface TournamentRepositoryPort {
  createTournament(data: Partial<Tournament>): Promise<Tournament>;
  updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament>;
  findTournamentById(id: string): Promise<Tournament | null>;
  createStage(data: Partial<Stage>): Promise<Stage>;
  updateStage(id: string, data: Partial<Stage>): Promise<Stage>;
  findStageById(id: string): Promise<Stage | null>;
  createTeam(data: Partial<Team>): Promise<Team>;
  createSubmission(data: Partial<Submission>): Promise<Submission>;
  createAnnouncement(data: Partial<Announcement>): Promise<Announcement>;
  createJudgeAssignment(data: Partial<JudgeAssignment>): Promise<JudgeAssignment>;
  findTournamentTeams(tournamentId: string): Promise<Team[]>;
}
