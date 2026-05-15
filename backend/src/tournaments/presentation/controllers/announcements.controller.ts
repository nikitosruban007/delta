import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAnnouncementUseCase } from '../../application/use-cases/create-announcement.use-case';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly createAnnouncement: CreateAnnouncementUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create tournament announcement (owner or admin only)',
  })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAnnouncementDto) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException(
        'Only admins and organizers can create announcements',
      );
    }
    return this.createAnnouncement.execute({
      tournamentId: dto.tournamentId,
      authorId: user.id,
      title: dto.title,
      body: dto.body,
      authorIsAdmin: user.roles.includes('ADMIN'),
    });
  }

  @Get('tournament/:tournamentId')
  @ApiOperation({ summary: 'List announcements for a tournament' })
  async list(@Param('tournamentId') tournamentId: string) {
    const rows = await this.prisma.announcements.findMany({
      where: { tournament_id: Number(tournamentId) },
      orderBy: { created_at: 'desc' },
      include: {
        users: { select: { id: true, name: true, avatar_url: true } },
      },
    });
    return rows.map((r) => ({
      id: String(r.id),
      tournamentId: String(r.tournament_id),
      title: r.title,
      body: r.body,
      createdAt: r.created_at,
      author: r.users
        ? {
            id: String(r.users.id),
            name: r.users.name,
            avatarUrl: r.users.avatar_url,
          }
        : null,
    }));
  }
}
