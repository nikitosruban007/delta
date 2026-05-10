import { Body, Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAnnouncementUseCase } from '../../application/use-cases/create-announcement.use-case';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';

type AuthUser = { id: string; email: string; roles: string[]; permissions: string[] };

@ApiTags('announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly createAnnouncement: CreateAnnouncementUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create tournament announcement (Admin/Organizer only)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAnnouncementDto) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException('Only admins and organizers can create announcements');
    }
    return this.createAnnouncement.execute(dto);
  }
}
