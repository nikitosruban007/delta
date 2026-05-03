import { validateSync } from 'class-validator';
import { ExportResultsQueryDto } from './export-results-query.dto';

describe('ExportResultsQueryDto', () => {
  it('accepts csv format', () => {
    const dto = new ExportResultsQueryDto();
    dto.format = 'csv';

    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects unsupported formats', () => {
    const dto = new ExportResultsQueryDto();
    dto.format = 'xlsx' as any;

    expect(validateSync(dto).map((error) => error.property)).toEqual(['format']);
  });
});
