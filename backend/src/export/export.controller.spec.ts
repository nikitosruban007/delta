import { StreamableFile } from '@nestjs/common';
import { Readable } from 'node:stream';
import { ExportController } from './export.controller';

describe('ExportController', () => {
  it('sets csv response headers and returns a StreamableFile', async () => {
    const stream = Readable.from(['csv']);
    const service = {
      streamResultsCsv: jest.fn().mockResolvedValue(stream),
    };
    const response = {
      set: jest.fn(),
    };
    const controller = new ExportController(service as any);

    const result = await controller.exportResults('3', {}, response as any);

    expect(result).toBeInstanceOf(StreamableFile);
    expect(service.streamResultsCsv).toHaveBeenCalledWith('3');
    expect(response.set).toHaveBeenCalledWith({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="tournament-3-results.csv"',
    });
  });
});
