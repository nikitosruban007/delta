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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

type AuthUser = { id: string; email: string; roles: string[]; permissions: string[] };

class CreateCriterionDto {
  @ApiProperty() @IsString() @Length(2, 200) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(0, 1000) description?: string;
  @ApiPropertyOptional({ default: 100 })
  @IsOptional() @IsInt() @Min(1) @Max(1000)
  maxScore?: number;
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @IsNumber() @Min(0)
  weight?: number;
  @ApiPropertyOptional({ description: 'Bind criterion to a specific round; null/omit = whole tournament' })
  @IsOptional() @IsInt()
  roundId?: number;
  @ApiPropertyOptional({ description: 'Parent criterion id, if this is a subcriterion' })
  @IsOptional() @IsInt()
  parentId?: number;
}

class UpdateCriterionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(0, 1000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(1000) maxScore?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) weight?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() roundId?: number | null;
}

function serialize(row: {
  id: number;
  tournament_id: number | null;
  round_id: number | null;
  parent_id: number | null;
  title: string | null;
  description: string | null;
  max_score: number | null;
  weight: number | null;
}) {
  return {
    id: String(row.id),
    tournamentId: row.tournament_id ? String(row.tournament_id) : null,
    roundId: row.round_id ? String(row.round_id) : null,
    parentId: row.parent_id ? String(row.parent_id) : null,
    title: row.title ?? '',
    description: row.description,
    maxScore: row.max_score ?? 100,
    weight: row.weight ?? 1,
  };
}

@ApiTags('criteria')
@Controller('tournaments/:tournamentId/criteria')
export class CriteriaController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'List evaluation criteria for a tournament' })
  async list(@Param('tournamentId') tournamentId: string) {
    const tId = Number(tournamentId);
    const tournament = await this.prisma.tournaments.findUnique({ where: { id: tId } });
    if (!tournament) throw new NotFoundException('Tournament not found');
    const rows = await this.prisma.evaluation_criteria.findMany({
      where: { tournament_id: tId },
      orderBy: [{ parent_id: 'asc' }, { id: 'asc' }],
    });
    return rows.map(serialize);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create evaluation criterion (owner or admin only)' })
  async create(
    @CurrentUser() user: AuthUser,
    @Param('tournamentId') tournamentId: string,
    @Body() dto: CreateCriterionDto,
  ) {
    const tId = Number(tournamentId);
    const tournament = await this.prisma.tournaments.findUnique({ where: { id: tId } });
    if (!tournament) throw new NotFoundException('Tournament not found');
    const isAdmin = user.roles.includes('ADMIN');
    if (!isAdmin && tournament.created_by !== Number(user.id)) {
      throw new ForbiddenException('You do not own this tournament');
    }

    if (dto.roundId) {
      const round = await this.prisma.rounds.findUnique({ where: { id: dto.roundId } });
      if (!round || round.tournament_id !== tId) {
        throw new BadRequestException('Round does not belong to this tournament');
      }
    }
    if (dto.parentId) {
      const parent = await this.prisma.evaluation_criteria.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent || parent.tournament_id !== tId) {
        throw new BadRequestException('Parent criterion does not belong to this tournament');
      }
      if (parent.parent_id !== null) {
        throw new BadRequestException('Subcriteria cannot be nested more than one level');
      }
    }

    const row = await this.prisma.evaluation_criteria.create({
      data: {
        tournament_id: tId,
        round_id: dto.roundId ?? null,
        parent_id: dto.parentId ?? null,
        title: dto.title,
        description: dto.description ?? null,
        max_score: dto.maxScore ?? 100,
        weight: dto.weight ?? 1,
      },
    });
    return serialize(row);
  }

  @Patch(':criterionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update evaluation criterion (owner or admin only)' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('tournamentId') tournamentId: string,
    @Param('criterionId') criterionId: string,
    @Body() dto: UpdateCriterionDto,
  ) {
    const tId = Number(tournamentId);
    const cId = Number(criterionId);
    const criterion = await this.prisma.evaluation_criteria.findUnique({ where: { id: cId } });
    if (!criterion || criterion.tournament_id !== tId) {
      throw new NotFoundException('Criterion not found');
    }
    const tournament = await this.prisma.tournaments.findUnique({ where: { id: tId } });
    const isAdmin = user.roles.includes('ADMIN');
    if (!isAdmin && tournament?.created_by !== Number(user.id)) {
      throw new ForbiddenException('You do not own this tournament');
    }
    if (dto.roundId !== undefined && dto.roundId !== null) {
      const round = await this.prisma.rounds.findUnique({ where: { id: dto.roundId } });
      if (!round || round.tournament_id !== tId) {
        throw new BadRequestException('Round does not belong to this tournament');
      }
    }
    const row = await this.prisma.evaluation_criteria.update({
      where: { id: cId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.maxScore !== undefined && { max_score: dto.maxScore }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.roundId !== undefined && { round_id: dto.roundId }),
      },
    });
    return serialize(row);
  }

  @Delete(':criterionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete evaluation criterion (owner or admin only)' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('tournamentId') tournamentId: string,
    @Param('criterionId') criterionId: string,
  ) {
    const tId = Number(tournamentId);
    const cId = Number(criterionId);
    const criterion = await this.prisma.evaluation_criteria.findUnique({ where: { id: cId } });
    if (!criterion || criterion.tournament_id !== tId) {
      throw new NotFoundException('Criterion not found');
    }
    const tournament = await this.prisma.tournaments.findUnique({ where: { id: tId } });
    const isAdmin = user.roles.includes('ADMIN');
    if (!isAdmin && tournament?.created_by !== Number(user.id)) {
      throw new ForbiddenException('You do not own this tournament');
    }
    await this.prisma.evaluation_criteria.delete({ where: { id: cId } });
    return { ok: true };
  }
}
