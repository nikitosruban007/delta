import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { SubmitWorkUseCase } from '../../application/use-cases/submit-work.use-case';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { TOURNAMENT_REPOSITORY } from '../../application/ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../../application/ports/tournament.repository.port';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

class CreateSubmissionDto {
  @ApiProperty() @IsString() roundId!: string;
  @ApiProperty() @IsString() teamId!: string;
  @ApiProperty() @IsUrl() githubUrl!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() videoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() liveDemoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(0, 2000) description?: string;
}

type AuthUser = { id: string; email: string; roles: string[]; permissions: string[] };

@ApiTags('submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly submitWork: SubmitWorkUseCase,
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create or update a submission for a round (before its deadline)' })
  async submit(@CurrentUser() user: AuthUser, @Body() dto: CreateSubmissionDto) {
    return this.submitWork.execute({
      stageId: dto.roundId,
      teamId: dto.teamId,
      userId: user.id,
      githubUrl: dto.githubUrl,
      videoUrl: dto.videoUrl ?? null,
      liveDemoUrl: dto.liveDemoUrl ?? null,
      description: dto.description ?? null,
    });
  }

  @Get('team')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current team submission for a round (if any)' })
  @ApiQuery({ name: 'teamId', required: true })
  @ApiQuery({ name: 'roundId', required: true })
  async getCurrentForTeam(
    @CurrentUser() user: AuthUser,
    @Query('teamId') teamId: string,
    @Query('roundId') roundId: string,
  ) {
    const tId = Number(teamId);
    const rId = Number(roundId);
    if (!Number.isInteger(tId) || !Number.isInteger(rId)) {
      throw new NotFoundException('Invalid teamId or roundId');
    }
    const membership = await this.prisma.team_members.findFirst({
      where: { team_id: tId, user_id: Number(user.id) },
      select: { id: true },
    });
    if (!membership && !user.roles.includes('ADMIN')) {
      throw new NotFoundException('Submission not found');
    }
    const row = await this.prisma.submissions.findFirst({
      where: { team_id: tId, round_id: rId },
      include: { rounds: { select: { deadline_at: true, tournament_id: true } } },
    });
    if (!row) {
      const round = await this.prisma.rounds.findUnique({
        where: { id: rId },
        select: { deadline_at: true, tournament_id: true },
      });
      return {
        submission: null,
        deadlineAt: round?.deadline_at ?? null,
        locked: round?.deadline_at ? round.deadline_at.getTime() < Date.now() : false,
      };
    }
    const deadlineAt = row.rounds?.deadline_at ?? null;
    return {
      submission: {
        id: String(row.id),
        teamId: String(row.team_id),
        roundId: String(row.round_id),
        githubUrl: row.github_url,
        videoUrl: row.video_url,
        liveDemoUrl: row.live_demo_url,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      deadlineAt,
      locked: deadlineAt ? deadlineAt.getTime() < Date.now() : false,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get submission by id' })
  async getById(@Param('id') id: string) {
    const submission = await this.repo.findSubmissionById(id);
    if (!submission) throw new NotFoundException('Submission not found');
    return submission;
  }
}
