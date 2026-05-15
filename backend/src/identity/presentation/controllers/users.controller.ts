import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AssignRoleUseCase } from '../../application/use-cases/assign-role.use-case';
import { RevokeRoleUseCase } from '../../application/use-cases/revoke-role.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly revokeRoleUseCase: RevokeRoleUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get('admin/stats')
  @ApiOperation({ summary: 'Platform overview counters (ADMIN only)' })
  async stats(
    @CurrentUser() current: { id: string; email: string; roles: string[] },
  ) {
    if (!current.roles.includes('ADMIN')) {
      throw new ForbiddenException('Admin only');
    }
    const [
      users,
      tournaments,
      teams,
      submissions,
      evaluations,
      announcements,
      forumTopics,
      forumPosts,
      openReports,
    ] = await Promise.all([
      this.prisma.users.count(),
      this.prisma.tournaments.count(),
      this.prisma.teams.count(),
      this.prisma.submissions.count(),
      this.prisma.evaluations.count(),
      this.prisma.announcements.count(),
      this.prisma.forum_topics.count(),
      this.prisma.forum_posts.count(),
      this.prisma.forum_reports.count({ where: { status: 'open' } }),
    ]);
    const byStatus = await this.prisma.tournaments.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return {
      users,
      tournaments,
      tournamentsByStatus: Object.fromEntries(
        byStatus.map((b) => [b.status ?? 'draft', b._count._all]),
      ),
      teams,
      submissions,
      evaluations,
      announcements,
      forumTopics,
      forumPosts,
      openReports,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List users with roles (ADMIN only)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listAll(
    @CurrentUser() current: { id: string; email: string; roles: string[] },
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    if (!current.roles.includes('ADMIN')) {
      throw new ForbiddenException('Admin only');
    }
    const take = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const term = (q ?? '').trim();
    const where = term
      ? {
          OR: [
            { email: { contains: term, mode: 'insensitive' as const } },
            { name: { contains: term, mode: 'insensitive' as const } },
            { username: { contains: term, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const rows = await this.prisma.users.findMany({
      where,
      take,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar_url: true,
        status: true,
        created_at: true,
        user_roles_user_roles_user_idTousers: {
          select: { roles: { select: { id: true, name: true } } },
        },
      },
    });
    return rows.map((r) => ({
      id: String(r.id),
      email: r.email,
      name: r.name,
      username: r.username,
      avatarUrl: r.avatar_url,
      status: r.status,
      createdAt: r.created_at,
      roles: r.user_roles_user_roles_user_idTousers
        .map((ur) => ur.roles)
        .filter((x): x is { id: number; name: string } => Boolean(x))
        .map((ur) => ({ id: String(ur.id), name: ur.name })),
    }));
  }

  @Get('roles/all')
  @ApiOperation({ summary: 'List roles (ADMIN only)' })
  async listAllRoles(
    @CurrentUser() current: { id: string; email: string; roles: string[] },
  ) {
    if (!current.roles.includes('ADMIN')) {
      throw new ForbiddenException('Admin only');
    }
    const rows = await this.prisma.roles.findMany({ orderBy: { id: 'asc' } });
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      description: r.description,
    }));
  }

  @Post(':userId/roles/by-name')
  @ApiOperation({ summary: 'Assign role to user by role name (ADMIN only)' })
  async assignRoleByName(
    @CurrentUser() current: { id: string; email: string; roles: string[] },
    @Param('userId') userId: string,
    @Body() dto: { roleName: string },
  ) {
    if (!current.roles.includes('ADMIN')) {
      throw new ForbiddenException('Admin only');
    }
    const role = await this.prisma.roles.findFirst({
      where: { name: dto.roleName },
      select: { id: true },
    });
    if (!role) throw new NotFoundException(`Role "${dto.roleName}" not found`);
    const uid = Number(userId);
    const user = await this.prisma.users.findUnique({
      where: { id: uid },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const existing = await this.prisma.user_roles.findFirst({
      where: { user_id: uid, role_id: role.id },
      select: { id: true },
    });
    if (!existing) {
      await this.prisma.user_roles.create({
        data: { user_id: uid, role_id: role.id },
      });
    }
    return { ok: true };
  }

  @Delete(':userId/roles/by-name/:roleName')
  @ApiOperation({ summary: 'Revoke role from user by role name (ADMIN only)' })
  async revokeRoleByName(
    @CurrentUser() current: { id: string; email: string; roles: string[] },
    @Param('userId') userId: string,
    @Param('roleName') roleName: string,
  ) {
    if (!current.roles.includes('ADMIN')) {
      throw new ForbiddenException('Admin only');
    }
    const role = await this.prisma.roles.findFirst({
      where: { name: roleName },
      select: { id: true },
    });
    if (!role) throw new NotFoundException(`Role "${roleName}" not found`);
    await this.prisma.user_roles.deleteMany({
      where: { user_id: Number(userId), role_id: role.id },
    });
    return { ok: true };
  }

  @Get('me/tournaments')
  @ApiOperation({
    summary:
      'Tournaments the current user is involved in (as team member, captain, organizer, or judge)',
  })
  async myTournaments(
    @CurrentUser() current: { id: string; email: string; roles: string[] },
  ) {
    const userId = Number(current.id);

    // 1. Team memberships → tournaments
    const memberships = await this.prisma.team_members.findMany({
      where: { user_id: userId },
      include: {
        teams: {
          include: {
            tournament_teams: {
              include: { tournaments: true },
            },
          },
        },
      },
    });

    // 2. Owned tournaments
    const owned = await this.prisma.tournaments.findMany({
      where: { created_by: userId },
    });

    // 3. Judge assignments
    const judgeAssignments = await this.prisma.judge_assignments.findMany({
      where: { judge_id: userId },
      include: { tournaments: true, rounds: true },
    });

    type Row = {
      tournament: any;
      role: 'captain' | 'member' | 'organizer' | 'judge';
      teamId?: string;
      teamName?: string;
      stageId?: string | null;
      stageTitle?: string | null;
    };

    const byTournament = new Map<number, Row[]>();
    const push = (t: any, row: Omit<Row, 'tournament'>) => {
      if (!t) return;
      const arr = byTournament.get(t.id) ?? [];
      arr.push({ tournament: t, ...row });
      byTournament.set(t.id, arr);
    };

    for (const m of memberships) {
      if (!m.teams) continue;
      const role: 'captain' | 'member' =
        m.teams.captain_id === userId ? 'captain' : 'member';
      for (const tt of m.teams.tournament_teams) {
        push(tt.tournaments, {
          role,
          teamId: String(m.teams.id),
          teamName: m.teams.name,
        });
      }
    }
    for (const t of owned) {
      push(t, { role: 'organizer' });
    }
    for (const j of judgeAssignments) {
      push(j.tournaments, {
        role: 'judge',
        stageId: j.stage_id ? String(j.stage_id) : null,
        stageTitle: j.rounds?.title ?? null,
      });
    }

    const out: Array<{
      tournamentId: string;
      title: string;
      status: string | null;
      startsAt: Date | null;
      endsAt: Date | null;
      registrationDeadline: Date | null;
      roles: Row['role'][];
      teams: { id: string; name: string; isCaptain: boolean }[];
      judgeStages: { id: string | null; title: string | null }[];
    }> = [];

    for (const [tournamentId, rows] of byTournament.entries()) {
      const t = rows[0].tournament;
      const roles = Array.from(new Set(rows.map((r) => r.role)));
      const teams = rows
        .filter((r) => r.teamId)
        .map((r) => ({
          id: r.teamId!,
          name: r.teamName ?? '',
          isCaptain: r.role === 'captain',
        }));
      const judgeStages = rows
        .filter((r) => r.role === 'judge')
        .map((r) => ({ id: r.stageId ?? null, title: r.stageTitle ?? null }));
      out.push({
        tournamentId: String(tournamentId),
        title: t.title,
        status: t.status,
        startsAt: t.starts_at,
        endsAt: t.ends_at,
        registrationDeadline: t.registration_deadline,
        roles,
        teams,
        judgeStages,
      });
    }

    return out.sort((a, b) => {
      // Active first, then registration, then drafts, then finished
      const order = {
        active: 0,
        registration: 1,
        draft: 2,
        finished: 3,
      } as Record<string, number>;
      const ra = order[a.status ?? 'draft'] ?? 99;
      const rb = order[b.status ?? 'draft'] ?? 99;
      return ra - rb;
    });
  }

  @Get('search')
  @ApiOperation({
    summary:
      'Search users by email, username or name (for team registration / judge picker)',
  })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false })
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    const term = (q ?? '').trim();
    if (term.length < 2) return [];
    const take = Math.min(Math.max(Number(limit) || 10, 1), 25);
    const rows = await this.prisma.users.findMany({
      where: {
        status: 'active',
        OR: [
          { email: { contains: term, mode: 'insensitive' } },
          { username: { contains: term, mode: 'insensitive' } },
          { name: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar_url: true,
      },
      take,
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => ({
      id: String(r.id),
      email: r.email,
      username: r.username,
      name: r.name,
      avatarUrl: r.avatar_url,
    }));
  }

  @Post(':userId/roles')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Assign role to user' })
  assignRole(
    @Param('userId') userId: string,
    @Body() dto: Omit<AssignRoleDto, 'userId'>,
    @Req() req: any,
  ) {
    return this.assignRoleUseCase.execute({
      userId,
      roleId: dto.roleId,
      assignedBy: req.user.id,
    });
  }

  @Delete(':userId/roles/:roleId')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Revoke role from user' })
  revokeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.revokeRoleUseCase.execute({ userId, roleId });
  }
}
