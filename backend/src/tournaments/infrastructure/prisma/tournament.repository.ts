import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TournamentRepositoryPort } from '../../application/ports/tournament.repository.port';
import { Tournament } from '../../domain/entities/tournament.entity';
import { Stage } from '../../domain/entities/stage.entity';
import { Team } from '../../domain/entities/team.entity';
import { Submission } from '../../domain/entities/submission.entity';
import { Announcement } from '../../domain/entities/announcement.entity';
import { JudgeAssignment } from '../../domain/entities/judge-assignment.entity';
import { TournamentStatus } from '../../domain/enums/tournament-status.enum';
import { TeamStatus } from '../../domain/enums/team-status.enum';
import { StageStatus } from '../../domain/enums/stage-status.enum';
import { ScoreStatus } from '../../domain/enums/score-status.enum';

@Injectable()
export class PrismaTournamentRepository implements TournamentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Tournaments ─────────────────────────────────────────────────────────────

  async listTournaments(status?: string): Promise<Tournament[]> {
    const rows = await this.prisma.tournaments.findMany({
      where: status ? { status: this.toPrismaStatus(status) } : undefined,
      orderBy: { created_at: 'desc' },
    });
    return rows.map(this.toTournamentEntity);
  }

  async createTournament(data: Partial<Tournament>): Promise<Tournament> {
    const row = await this.prisma.tournaments.create({
      data: {
        title: data.title ?? '',
        description: data.description ?? null,
        status: 'draft',
        created_by: data.organizerId ? Number(data.organizerId) : null,
        registration_deadline: data.registrationDeadline ?? null,
        starts_at: data.startsAt ?? null,
        ends_at: data.endsAt ?? null,
      },
    });
    return this.toTournamentEntity(row);
  }

  async updateTournament(
    id: string,
    data: Partial<Tournament>,
  ): Promise<Tournament> {
    const row = await this.prisma.tournaments.update({
      where: { id: Number(id) },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.status !== undefined && {
          status: this.toPrismaStatus(data.status),
        }),
        ...(data.registrationDeadline !== undefined && {
          registration_deadline: data.registrationDeadline,
        }),
        ...(data.startsAt !== undefined && { starts_at: data.startsAt }),
        ...(data.endsAt !== undefined && { ends_at: data.endsAt }),
        ...(data.maxTeams !== undefined &&
          data.maxTeams !== null && { max_teams: data.maxTeams }),
        ...(data.teamSizeMin !== undefined &&
          data.teamSizeMin !== null && { team_size_min: data.teamSizeMin }),
        ...(data.teamSizeMax !== undefined &&
          data.teamSizeMax !== null && { team_size_max: data.teamSizeMax }),
        ...(data.rules !== undefined && { rules: data.rules }),
      },
    });
    return this.toTournamentEntity(row);
  }

  async findTournamentById(id: string): Promise<Tournament | null> {
    const row = await this.prisma.tournaments.findUnique({
      where: { id: Number(id) },
    });
    return row ? this.toTournamentEntity(row) : null;
  }

  // ─── Stages / Rounds ──────────────────────────────────────────────────────────

  async createStage(data: Partial<Stage>): Promise<Stage> {
    const row = await this.prisma.rounds.create({
      data: {
        tournament_id: Number(data.tournamentId),
        title: data.title ?? '',
        description: data.description ?? null,
        round_order: data.orderIndex ?? 0,
        deadline_at: data.deadlineAt ?? null,
      },
    });
    return this.toStageEntity(row);
  }

  async updateStage(id: string, data: Partial<Stage>): Promise<Stage> {
    const row = await this.prisma.rounds.update({
      where: { id: Number(id) },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.deadlineAt !== undefined && { deadline_at: data.deadlineAt }),
        ...(data.orderIndex !== undefined && { round_order: data.orderIndex }),
      },
    });
    return this.toStageEntity(row);
  }

  async findStageById(id: string): Promise<Stage | null> {
    const row = await this.prisma.rounds.findUnique({
      where: { id: Number(id) },
    });
    return row ? this.toStageEntity(row) : null;
  }

  async listStagesByTournament(tournamentId: string): Promise<Stage[]> {
    const rows = await this.prisma.rounds.findMany({
      where: { tournament_id: Number(tournamentId) },
      orderBy: { round_order: 'asc' },
    });
    return rows.map(this.toStageEntity);
  }

  // ─── Teams ────────────────────────────────────────────────────────────────────

  async createTeam(data: Partial<Team>): Promise<Team> {
    const team = await this.prisma.teams.create({
      data: {
        name: data.name ?? '',
        captain_id: data.captainId ? Number(data.captainId) : null,
      },
    });

    // Link team to tournament
    if (data.tournamentId) {
      await this.prisma.tournament_teams.create({
        data: {
          tournament_id: Number(data.tournamentId),
          team_id: team.id,
        },
      });
    }

    // Add captain as a member with role 'captain'
    if (data.captainId) {
      await this.prisma.team_members.create({
        data: {
          team_id: team.id,
          user_id: Number(data.captainId),
          role: 'captain',
        },
      });
    }

    return this.toTeamEntity(team, data.tournamentId ?? '');
  }

  async findTeamById(id: string): Promise<Team | null> {
    const team = await this.prisma.teams.findUnique({
      where: { id: Number(id) },
      include: { tournament_teams: true },
    });
    if (!team) return null;
    const tournamentId =
      team.tournament_teams[0]?.tournament_id?.toString() ?? '';
    return this.toTeamEntity(team, tournamentId);
  }

  async findTeamByTournamentAndCaptain(
    tournamentId: string,
    captainId: string,
  ): Promise<Team | null> {
    const tournamentTeam = await this.prisma.tournament_teams.findFirst({
      where: {
        tournament_id: Number(tournamentId),
        teams: { captain_id: Number(captainId) },
      },
      include: { teams: true },
    });
    if (!tournamentTeam?.teams) return null;
    return this.toTeamEntity(tournamentTeam.teams, tournamentId);
  }

  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const member = await this.prisma.team_members.findFirst({
      where: { team_id: Number(teamId), user_id: Number(userId) },
      select: { id: true },
    });
    return Boolean(member);
  }

  async findTournamentTeams(tournamentId: string): Promise<Team[]> {
    const rows = await this.prisma.tournament_teams.findMany({
      where: { tournament_id: Number(tournamentId) },
      include: {
        teams: { include: { team_members: { include: { users: true } } } },
      },
    });
    return rows
      .filter((row) => row.teams)
      .map((row) => this.toTeamEntity(row.teams!, tournamentId));
  }

  // ─── Submissions ──────────────────────────────────────────────────────────────

  async createSubmission(
    data: Partial<Submission> & {
      videoUrl?: string | null;
      liveDemoUrl?: string | null;
      description?: string | null;
    },
  ): Promise<Submission> {
    const row = await this.prisma.submissions.create({
      data: {
        team_id: Number(data.teamId),
        round_id: Number(data.stageId),
        github_url: data.contentUrl ?? null,
        video_url: data.videoUrl ?? null,
        live_demo_url: data.liveDemoUrl ?? null,
        description: data.description ?? null,
        status: 'submitted',
      },
    });
    return this.toSubmissionEntity(row);
  }

  async findSubmissionById(id: string): Promise<Submission | null> {
    const row = await this.prisma.submissions.findUnique({
      where: { id: Number(id) },
    });
    return row ? this.toSubmissionEntity(row) : null;
  }

  async findSubmissionByTeamAndStage(
    teamId: string,
    stageId: string,
  ): Promise<Submission | null> {
    const row = await this.prisma.submissions.findFirst({
      where: { team_id: Number(teamId), round_id: Number(stageId) },
    });
    return row ? this.toSubmissionEntity(row) : null;
  }

  async updateSubmission(
    id: string,
    data: Partial<Submission>,
  ): Promise<Submission> {
    const row = await this.prisma.submissions.update({
      where: { id: Number(id) },
      data: {
        ...(data.contentUrl !== undefined && { github_url: data.contentUrl }),
        ...(data.status !== undefined && {
          status: this.toPrismaSubmissionStatus(data.status),
        }),
      },
    });
    return this.toSubmissionEntity(row);
  }

  async listSubmissionsByTournament(
    tournamentId: string,
  ): Promise<Submission[]> {
    const rows = await this.prisma.submissions.findMany({
      where: {
        rounds: { tournament_id: Number(tournamentId) },
      },
      include: { rounds: true, teams: true },
    });
    return rows.map(this.toSubmissionEntity);
  }

  async listSubmissionsForJudge(
    judgeId: string,
  ): Promise<
    import('../../application/ports/tournament.repository.port').SubmissionWithEvaluation[]
  > {
    const numericJudge = Number(judgeId);
    const assignments = await this.prisma.judge_assignments.findMany({
      where: { judge_id: numericJudge },
      select: { tournament_id: true, stage_id: true },
    });
    if (assignments.length === 0) return [];

    const stageIds = assignments
      .filter((a) => a.stage_id !== null)
      .map((a) => a.stage_id!);
    const wholeTournamentIds = assignments
      .filter((a) => a.stage_id === null)
      .map((a) => a.tournament_id);

    const orConditions: any[] = [];
    if (stageIds.length > 0) orConditions.push({ round_id: { in: stageIds } });
    if (wholeTournamentIds.length > 0) {
      orConditions.push({
        rounds: { tournament_id: { in: wholeTournamentIds } },
      });
    }

    const rows = await this.prisma.submissions.findMany({
      where: {
        AND: [
          { status: { in: ['submitted', 'reviewed'] } },
          { OR: orConditions },
        ],
      },
      include: {
        rounds: {
          include: {
            tournaments: {
              select: { id: true, title: true, status: true },
            },
          },
        },
        teams: { select: { id: true, name: true } },
        evaluations: {
          where: { jury_id: Number(judgeId) },
          select: { id: true, total_score: true, comment: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return rows
      .filter((row) => row.rounds?.tournaments)
      .map((row) => ({
        id: String(row.id),
        teamId: String(row.team_id),
        teamName: row.teams?.name ?? '',
        stageId: String(row.round_id),
        stageName: row.rounds?.title ?? '',
        tournamentId: String(row.rounds?.tournament_id),
        tournamentTitle: row.rounds?.tournaments?.title ?? '',
        githubUrl: row.github_url,
        videoUrl: row.video_url,
        liveDemoUrl: row.live_demo_url,
        description: row.description,
        status: row.status ?? 'submitted',
        createdAt: row.created_at ?? new Date(),
        evaluation: row.evaluations[0]
          ? {
              id: row.evaluations[0].id,
              totalScore: row.evaluations[0].total_score ?? 0,
              comment: row.evaluations[0].comment,
            }
          : null,
      }));
  }

  // ─── Announcements ───────────────────────────────────────────────────────────

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

  // ─── Judge Assignments ───────────────────────────────────────────────────────

  async createJudgeAssignment(
    data: Partial<JudgeAssignment>,
  ): Promise<JudgeAssignment> {
    return new JudgeAssignment(
      crypto.randomUUID(),
      data.tournamentId ?? '',
      data.judgeId ?? '',
      data.stageId ?? null,
      new Date(),
      new Date(),
    );
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────────

  private toTournamentEntity = (row: {
    id: number;
    title: string;
    description: string | null;
    status: string | null;
    created_by: number | null;
    registration_deadline?: Date | null;
    starts_at?: Date | null;
    ends_at?: Date | null;
    created_at?: Date | null;
    max_teams?: number | null;
    team_size_min?: number | null;
    team_size_max?: number | null;
    rules?: string | null;
  }): Tournament => {
    return new Tournament(
      String(row.id),
      row.title,
      row.description,
      row.created_by ? String(row.created_by) : undefined,
      this.toDomainStatus(row.status),
      row.registration_deadline ?? null,
      row.starts_at ?? null,
      row.ends_at ?? null,
      row.created_at ?? new Date(),
      row.created_at ?? new Date(),
      row.max_teams ?? null,
      row.team_size_min ?? null,
      row.team_size_max ?? null,
      row.rules ?? null,
    );
  };

  private toStageEntity = (row: {
    id: number;
    tournament_id: number;
    title: string;
    description?: string | null;
    round_order: number | null;
    deadline_at?: Date | null;
    created_at?: Date | null;
  }): Stage => {
    return new Stage(
      String(row.id),
      String(row.tournament_id),
      row.title,
      row.description ?? null,
      row.round_order ?? 0,
      StageStatus.OPEN,
      row.deadline_at ?? null,
      row.created_at ?? new Date(),
      row.created_at ?? new Date(),
    );
  };

  private toTeamEntity = (
    row: {
      id: number;
      name: string;
      captain_id: number | null;
      created_at?: Date | null;
    },
    tournamentId: string,
  ): Team => {
    return new Team(
      String(row.id),
      tournamentId,
      row.captain_id ? String(row.captain_id) : '',
      row.name,
      TeamStatus.REGISTERED,
      row.created_at ?? new Date(),
      row.created_at ?? new Date(),
    );
  };

  private toSubmissionEntity = (row: {
    id: number;
    team_id: number;
    round_id: number;
    github_url: string | null;
    status: string | null;
    created_at?: Date | null;
  }): Submission => {
    return new Submission(
      String(row.id),
      String(row.round_id),
      String(row.team_id),
      row.github_url,
      this.toDomainSubmissionStatus(row.status),
      row.created_at ?? new Date(),
      row.created_at ?? new Date(),
    );
  };

  private toDomainStatus(status: string | null): TournamentStatus {
    const valid = ['draft', 'registration', 'active', 'finished'];
    const s = status ?? 'draft';
    return (valid.includes(s) ? s : 'draft') as TournamentStatus;
  }

  private toPrismaStatus(
    status: string,
  ): 'draft' | 'registration' | 'active' | 'finished' {
    const valid = ['draft', 'registration', 'active', 'finished'];
    return (valid.includes(status) ? status : 'draft') as
      | 'draft'
      | 'registration'
      | 'active'
      | 'finished';
  }

  private toDomainSubmissionStatus(status: string | null): ScoreStatus {
    const map: Record<string, ScoreStatus> = {
      draft: ScoreStatus.DRAFT,
      submitted: ScoreStatus.SUBMITTED,
      reviewed: ScoreStatus.REVIEWED,
    };
    return map[status ?? 'draft'] ?? ScoreStatus.DRAFT;
  }

  private toPrismaSubmissionStatus(
    status: ScoreStatus,
  ): 'draft' | 'submitted' | 'reviewed' {
    const map: Record<ScoreStatus, 'draft' | 'submitted' | 'reviewed'> = {
      [ScoreStatus.DRAFT]: 'draft',
      [ScoreStatus.SUBMITTED]: 'submitted',
      [ScoreStatus.REVIEWED]: 'reviewed',
    };
    return map[status] ?? 'draft';
  }
}
