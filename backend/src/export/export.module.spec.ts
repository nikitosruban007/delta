import { MODULE_METADATA } from '@nestjs/common/constants';
import { ExportController } from './export.controller';
import { ExportModule } from './export.module';
import { ExportService } from './export.service';

describe('ExportModule', () => {
  it('wires controller and provider', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ExportModule)).toContain(
      ExportController,
    );
    expect(Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ExportModule)).toContain(
      ExportService,
    );
  });
});
