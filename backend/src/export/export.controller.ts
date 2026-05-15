import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportResultsQueryDto } from './dto/export-results-query.dto';
import { ExportService } from './export.service';

@ApiTags('export')
@Controller('tournaments/:id/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get()
  @ApiOperation({ summary: 'Export tournament results as CSV' })
  async exportResults(
    @Param('id') id: string,
    @Query() _query: ExportResultsQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const stream = await this.exportService.streamResultsCsv(id);

    response.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tournament-${id}-results.csv"`,
    });

    return new StreamableFile(stream);
  }

  @Get('teams')
  @ApiOperation({ summary: 'Export team leaderboard as CSV' })
  async exportTeamLeaderboard(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const stream = await this.exportService.streamTeamLeaderboardCsv(id);
    response.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tournament-${id}-teams.csv"`,
    });
    return new StreamableFile(stream);
  }

  @Get('submissions')
  @ApiOperation({
    summary: 'Export tournament submissions (with avg score) as CSV',
  })
  async exportSubmissions(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const stream = await this.exportService.streamSubmissionsCsv(id);
    response.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tournament-${id}-submissions.csv"`,
    });
    return new StreamableFile(stream);
  }
}
