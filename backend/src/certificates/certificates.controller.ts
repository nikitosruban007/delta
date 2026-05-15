import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../identity/presentation/decorators/current-user.decorator';
import { CertificatesService } from './certificates.service';

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

@ApiTags('certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tournaments/:tournamentId/certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Get('teams/:teamId')
  @ApiOperation({
    summary:
      'Download a PDF certificate for a team (finished tournaments only; admin/owner/team member only)',
  })
  async downloadTeamCertificate(
    @Param('tournamentId') tournamentId: string,
    @Param('teamId') teamId: string,
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { stream, filename } = await this.certificates.streamTeamCertificate(
      tournamentId,
      teamId,
      user,
    );
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(stream);
  }
}
