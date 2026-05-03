import { Injectable } from '@nestjs/common';
import { TournamentRepositoryPort } from '../../application/ports/tournament.repository.port';
import { Tournament } from '../../domain/entities/tournament.entity';
import { Stage } from '../../domain/entities/stage.entity';
import { Team } from '../../domain/entities/team.entity';
import { Submission } from '../../domain/entities/submission.entity';
import { Announcement } from '../../domain/entities/announcement.entity';
import { JudgeAssignment } from '../../domain/entities/judge-assignment.entity';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';

@Injectable()
export class PrismaTournamentRepository implements TournamentRepositoryPort {
  async createTournament(data: Partial<Tournament>): Promise<Tournament> {
    return new Tournament(
      crypto.randomUUID(),
      data.title ?? '',
      data.description ?? null,
      data.organizerId ?? '',
      data.status ?? TournamentStatus.DRAFT,
      data.registrationDeadline ?? null,
      data.startsAt ?? null,
      data.endsAt ?? null,
      new Date(),
      new Date(),
    );
  }

  async updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament> {
    return new Tournament(
      id,
      data.title ?? 'updated',
      data.description ?? null,
      data.organizerId ?? 'organizer',
      data.status ?? TournamentStatus.DRAFT,
      data.registrationDeadline ?? null,
      data.startsAt ?? null,
      data.endsAt ?? null,
      new Date(),
      new Date(),
    );
  }

  async findTournamentById(id: string): Promise<Tournament | null> {
    return null;
  }

  async createStage(data: Partial<Stage>): Promise<Stage> {
    return new Stage(
      crypto.randomUUID(),
      data.tournamentId ?? '',
      data.title ?? '',
      data.description ?? null,
      data.orderIndex ?? 0,
      data.status!,
      data.deadlineAt ?? null,
      new Date(),
      new Date(),
    );
  }

  async updateStage(id: string, data: Partial<Stage>): Promise<Stage> {
    return new Stage(
      id,
      data.tournamentId ?? '',
      data.title ?? '',
      data.description ?? null,
      data.orderIndex ?? 0,
      data.status!,
      data.deadlineAt ?? null,
      new Date(),
      new Date(),
    );
  }

  async findStageById(id: string): Promise<Stage | null> {
    return null;
  }

  async createTeam(data: Partial<Team>): Promise<Team> {
    return new Team(
      crypto.randomUUID(),
      data.tournamentId ?? '',
      data.captainId ?? '',
      data.name ?? '',
      data.status!,
      new Date(),
      new Date(),
    );
  }

  async createSubmission(data: Partial<Submission>): Promise<Submission> {
    return new Submission(
      crypto.randomUUID(),
      data.stageId ?? '',
      data.teamId ?? '',
      data.title ?? '',
      data.contentUrl ?? null,
      data.status!,
      new Date(),
      new Date(),
    );
  }

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    return new Announcement(
      crypto.randomUUID(),
      data.tournamentId ?? '',
      data.authorId ?? '',
      data.title ?? '',
      data.body ?? '',
      new Date(),
      new Date(),
    );
  }

  async createJudgeAssignment(data: Partial<JudgeAssignment>): Promise<JudgeAssignment> {
    return new JudgeAssignment(
      crypto.randomUUID(),
      data.tournamentId ?? '',
      data.judgeId ?? '',
      data.stageId ?? null,
      new Date(),
      new Date(),
    );
  }

  async findTournamentTeams(tournamentId: string): Promise<Team[]> {
    return [];
  }
}
