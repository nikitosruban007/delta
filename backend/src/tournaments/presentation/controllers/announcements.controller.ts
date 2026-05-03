import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAnnouncementUseCase } from '../../application/use-cases/create-announcement.use-case';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { OrganizerGuard } from '../guards/organizer.guard';

@ApiTags('announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly createAnnouncement: CreateAnnouncementUseCase) {}

  @UseGuards(OrganizerGuard)
  @Post()
  create(@Body() dto: CreateAnnouncementDto) {
    return this.createAnnouncement.execute(dto);
  }
}
