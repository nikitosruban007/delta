import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubmitWorkUseCase } from '../../application/use-cases/submit-work.use-case';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { TOURNAMENT_REPOSITORY } from '../../application/ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../../application/ports/tournament.repository.port';
import { Inject } from '@nestjs/common';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateSubmissionDto {
  @ApiProperty() @IsString() roundId!: string;
  @ApiProperty() @IsString() teamId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() githubUrl?: string;
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
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create or update submission for a round' })
  async submit(@CurrentUser() user: AuthUser, @Body() dto: CreateSubmissionDto) {
    // Verify the team exists and user is a member
    const team = await this.repo.findTeamById(dto.teamId);
    if (!team) throw new NotFoundException('Team not found');

    const isMember = await this.repo.isTeamMember(dto.teamId, user.id);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return this.submitWork.execute({
      stageId: dto.roundId,
      teamId: dto.teamId,
      contentUrl: dto.githubUrl ?? null,
      videoUrl: dto.videoUrl ?? null,
      liveDemoUrl: dto.liveDemoUrl ?? null,
      description: dto.description ?? null,
    });
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
