import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

class CreateEventDto {
  @ApiProperty() @IsString() @Length(2, 200) title!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;
  @ApiProperty() @IsDateString() startsAt!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endsAt?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 200)
  location?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() roundId?: number;
}

class UpdateEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endsAt?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 200)
  location?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() roundId?: number | null;
}

function serialize(row: {
  id: number;
  tournament_id: number;
  round_id: number | null;
  title: string;
  description: string | null;
  starts_at: Date;
  ends_at: Date | null;
  location: string | null;
  created_at: Date | null;
  tournaments?: { id: number; title: string } | null;
  rounds?: { id: number; title: string } | null;
}) {
  return {
    id: String(row.id),
    tournamentId: String(row.tournament_id),
    roundId: row.round_id ? String(row.round_id) : null,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at ? row.ends_at.toISOString() : null,
    location: row.location,
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    tournament: row.tournaments
      ? { id: String(row.tournaments.id), title: row.tournaments.title }
      : null,
    round: row.rounds
      ? { id: String(row.rounds.id), title: row.rounds.title }
      : null,
  };
}

@ApiTags('schedule')
@Controller()
export class ScheduleController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('schedule')
  @ApiOperation({
    summary: 'Platform schedule (all tournaments) — upcoming first',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'ISO date lower bound (inclusive)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'ISO date upper bound (inclusive)',
  })
  @ApiQuery({ name: 'limit', required: false })
  async listGlobal(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Math.max(Number(limit) || 100, 1), 500);
    const where: any = {};
    if (from || to) {
      where.starts_at = {};
      if (from) where.starts_at.gte = new Date(from);
      if (to) where.starts_at.lte = new Date(to);
    }
    const rows = await this.prisma.tournament_events.findMany({
      where,
      orderBy: { starts_at: 'asc' },
      take,
      include: {
        tournaments: { select: { id: true, title: true } },
        rounds: { select: { id: true, title: true } },
      },
    });
    return rows.map(serialize);
  }

  @Get('tournaments/:tournamentId/schedule')
  @ApiOperation({ summary: 'List events for a tournament' })
  async listForTournament(@Param('tournamentId') tournamentId: string) {
    const tId = Number(tournamentId);
    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: tId },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    const rows = await this.prisma.tournament_events.findMany({
      where: { tournament_id: tId },
      orderBy: { starts_at: 'asc' },
      include: {
        rounds: { select: { id: true, title: true } },
      },
    });
    return rows.map((r) => serialize({ ...r, tournaments: null }));
  }

  @Post('tournaments/:tournamentId/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a schedule event (owner or admin only)' })
  async create(
    @CurrentUser() user: AuthUser,
    @Param('tournamentId') tournamentId: string,
    @Body() dto: CreateEventDto,
  ) {
    const tId = Number(tournamentId);
    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: tId },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    const isAdmin = user.roles.includes('ADMIN');
    if (!isAdmin && tournament.created_by !== Number(user.id)) {
      throw new ForbiddenException('You do not own this tournament');
    }

    if (dto.roundId !== undefined && dto.roundId !== null) {
      const round = await this.prisma.rounds.findUnique({
        where: { id: dto.roundId },
      });
      if (!round || round.tournament_id !== tId) {
        throw new BadRequestException(
          'Round does not belong to this tournament',
        );
      }
    }

    const startsAt = new Date(dto.startsAt);
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    if (endsAt && endsAt.getTime() < startsAt.getTime()) {
      throw new BadRequestException('endsAt cannot be earlier than startsAt');
    }

    const row = await this.prisma.tournament_events.create({
      data: {
        tournament_id: tId,
        round_id: dto.roundId ?? null,
        title: dto.title,
        description: dto.description ?? null,
        starts_at: startsAt,
        ends_at: endsAt,
        location: dto.location ?? null,
        created_by: Number(user.id),
      },
      include: { rounds: { select: { id: true, title: true } } },
    });
    return serialize({ ...row, tournaments: null });
  }

  @Patch('schedule/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a schedule event (owner or admin only)' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    const eId = Number(eventId);
    const event = await this.prisma.tournament_events.findUnique({
      where: { id: eId },
    });
    if (!event) throw new NotFoundException('Event not found');
    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: event.tournament_id },
    });
    const isAdmin = user.roles.includes('ADMIN');
    if (!isAdmin && tournament?.created_by !== Number(user.id)) {
      throw new ForbiddenException('You do not own this tournament');
    }

    if (dto.roundId !== undefined && dto.roundId !== null) {
      const round = await this.prisma.rounds.findUnique({
        where: { id: dto.roundId },
      });
      if (!round || round.tournament_id !== event.tournament_id) {
        throw new BadRequestException(
          'Round does not belong to this tournament',
        );
      }
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : event.starts_at;
    const endsAt =
      dto.endsAt === undefined
        ? event.ends_at
        : dto.endsAt
          ? new Date(dto.endsAt)
          : null;
    if (endsAt && endsAt.getTime() < startsAt.getTime()) {
      throw new BadRequestException('endsAt cannot be earlier than startsAt');
    }

    const row = await this.prisma.tournament_events.update({
      where: { id: eId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startsAt !== undefined && { starts_at: startsAt }),
        ...(dto.endsAt !== undefined && { ends_at: endsAt }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.roundId !== undefined && { round_id: dto.roundId }),
      },
      include: { rounds: { select: { id: true, title: true } } },
    });
    return serialize({ ...row, tournaments: null });
  }

  @Delete('schedule/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a schedule event (owner or admin only)' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('eventId') eventId: string,
  ) {
    const eId = Number(eventId);
    const event = await this.prisma.tournament_events.findUnique({
      where: { id: eId },
    });
    if (!event) throw new NotFoundException('Event not found');
    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: event.tournament_id },
    });
    const isAdmin = user.roles.includes('ADMIN');
    if (!isAdmin && tournament?.created_by !== Number(user.id)) {
      throw new ForbiddenException('You do not own this tournament');
    }
    await this.prisma.tournament_events.delete({ where: { id: eId } });
    return { ok: true };
  }
}
