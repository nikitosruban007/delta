import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateResultDto } from './dto/create-result.dto';
import { ListResultsQueryDto } from './dto/list-results-query.dto';
import { ResultsService } from './results.service';

@ApiTags('results')
@Controller('tournaments/:id/results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a tournament result' })
  createResult(@Param('id') id: string, @Body() dto: CreateResultDto) {
    return this.resultsService.createResult(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tournament results' })
  listResults(@Param('id') id: string, @Query() query: ListResultsQueryDto) {
    return this.resultsService.listResults(id, query);
  }
}
