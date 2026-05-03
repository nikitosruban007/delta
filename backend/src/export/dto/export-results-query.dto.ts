import { IsIn, IsOptional } from 'class-validator';

export class ExportResultsQueryDto {
  @IsOptional()
  @IsIn(['csv'])
  format?: 'csv' = 'csv';
}
