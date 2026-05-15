import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import type { Readable } from 'node:stream';
import { PrismaService } from '../prisma/prisma.service';

type PDFDocumentInstance = InstanceType<typeof PDFDocument>;

type CertificateContext = {
  tournamentTitle: string;
  teamName: string;
  memberName: string | null;
  rank: number | null;
  totalScore: number | null;
  finishedAt: Date;
};

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async streamTeamCertificate(
    tournamentIdParam: string,
    teamIdParam: string,
    requester: { id: string; roles: string[] } | null,
  ): Promise<{ stream: Readable; filename: string }> {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    const teamId = this.parseId(teamIdParam, 'teamId');

    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    if (tournament.status !== 'finished') {
      throw new BadRequestException(
        'Certificates are issued only for finished tournaments',
      );
    }

    const team = await this.prisma.teams.findUnique({
      where: { id: teamId },
      include: {
        team_members: {
          include: { users: { select: { id: true, name: true } } },
        },
      },
    });
    if (!team) throw new NotFoundException('Team not found');

    // Team must be registered in this tournament
    const link = await this.prisma.tournament_teams.findFirst({
      where: { tournament_id: tournamentId, team_id: teamId },
      select: { id: true },
    });
    if (!link) {
      throw new NotFoundException('Team is not registered in this tournament');
    }

    // Permission: ADMIN, organizer of the tournament, captain, or any team member.
    if (requester) {
      const requesterId = Number(requester.id);
      const isAdmin = requester.roles.includes('ADMIN');
      const isOwner = tournament.created_by === requesterId;
      const isMember = team.team_members.some((m) => m.user_id === requesterId);
      if (!isAdmin && !isOwner && !isMember) {
        throw new ForbiddenException(
          'You are not allowed to download this certificate',
        );
      }
    }

    const entry = await this.prisma.leaderboard_entries.findFirst({
      where: { tournament_id: tournamentId, team_id: teamId },
      select: { rank: true, total_score: true },
    });

    // If a single requester member name is known, personalize the cert.
    const requesterId = requester ? Number(requester.id) : null;
    const requesterMember = requesterId
      ? team.team_members.find((m) => m.user_id === requesterId)
      : null;
    const captainMember = team.team_members.find(
      (m) => m.user_id === team.captain_id,
    );
    const certificateName =
      requesterMember?.users?.name ??
      captainMember?.users?.name ??
      team.team_members[0]?.users?.name ??
      team.name;

    const ctx: CertificateContext = {
      tournamentTitle: tournament.title,
      teamName: team.name,
      memberName: certificateName,
      rank: entry?.rank ?? null,
      totalScore: entry?.total_score ?? null,
      finishedAt: tournament.ends_at ?? new Date(),
    };

    const filename = this.buildFilename(ctx);
    const stream = this.renderPdf(ctx);
    return { stream, filename };
  }

  private renderPdf(ctx: CertificateContext): Readable {
    const doc = new PDFDocument({
      size: [842, 595],
      margin: 0,
    });

    const pageW = doc.page.width;
    const pageH = doc.page.height;
    const templatePath = this.resolveCertificateTemplatePath();

    if (templatePath) {
      doc.image(templatePath, 0, 0, { width: pageW, height: pageH });
      this.coverTemplateText(doc);
      this.drawTemplateText(doc, ctx);
    } else {
      this.drawFallbackCertificate(doc, ctx);
    }

    const dateStr = ctx.finishedAt.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#f3f4f6')
      .text(dateStr, 36, pageH - 38, {
        width: 220,
        align: 'left',
      });

    doc.end();
    return doc;
  }

  private drawTemplateText(
    doc: PDFDocumentInstance,
    ctx: CertificateContext,
  ): void {
    const displayName = ctx.memberName ?? ctx.teamName;
    const pageW = doc.page.width;

    doc
      .font('Helvetica-Bold')
      .fontSize(40)
      .fillColor('#ffffff')
      .text('Сертифікат', 0, 176, { width: pageW, align: 'center' });

    doc
      .font('Helvetica')
      .fontSize(26)
      .fillColor('#ffffff')
      .text(displayName, 0, 252, { width: pageW, align: 'center' });

    doc
      .font('Helvetica')
      .fontSize(13.5)
      .fillColor('#d5d8df')
      .text(
        `Успішно завершив(-ла) турнір «${ctx.tournamentTitle}» від платформи FoldUp.`,
        0,
        336,
        { width: pageW, align: 'center' },
      );

    doc
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#d5d8df')
      .text('Ваш код став важливою частиною спільної архітектури.', 0, 365, {
        width: pageW,
        align: 'center',
      });

    doc
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#d5d8df')
      .text('Дякуємо, що перетворюєте ідеї на реальність.', 0, 384, {
        width: pageW,
        align: 'center',
      });

    doc
      .font('Helvetica-Oblique')
      .fontSize(13)
      .fillColor('#f59e0b')
      .text('Build. Team. Grow.', 0, 403, {
        width: pageW,
        align: 'center',
      });
  }

  private drawFallbackCertificate(
    doc: PDFDocumentInstance,
    ctx: CertificateContext,
  ): void {
    const pageW = doc.page.width;
    const pageH = doc.page.height;

    doc
      .lineWidth(3)
      .strokeColor('#1B345B')
      .rect(30, 30, pageW - 60, pageH - 60)
      .stroke();
    doc
      .lineWidth(1)
      .strokeColor('#5F72DF')
      .rect(45, 45, pageW - 90, pageH - 90)
      .stroke();

    doc
      .fillColor('#1B345B')
      .fontSize(36)
      .text('Сертифікат участі', 60, 90, { align: 'center' });

    doc
      .moveDown(0.3)
      .fontSize(14)
      .fillColor('#5b5f69')
      .text('FoldUp Tournament Platform', { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(16).fillColor('#111').text('Цим засвідчується, що команда', {
      align: 'center',
    });

    doc.moveDown(0.5);
    doc
      .fontSize(32)
      .fillColor('#5F72DF')
      .text(ctx.memberName ?? ctx.teamName, { align: 'center' });

    doc.moveDown(1);
    doc
      .fontSize(16)
      .fillColor('#111')
      .text('взяла участь у турнірі', { align: 'center' });

    doc.moveDown(0.5);
    doc
      .fontSize(22)
      .fillColor('#1B345B')
      .text(`«${ctx.tournamentTitle}»`, { align: 'center' });

    if (ctx.rank !== null) {
      const rankLine =
        ctx.rank === 1
          ? '🏆 Перше місце'
          : ctx.rank === 2
            ? '🥈 Друге місце'
            : ctx.rank === 3
              ? '🥉 Третє місце'
              : `Місце у рейтингу: ${ctx.rank}`;
      doc.fontSize(18).fillColor('#9a3412').text(rankLine, { align: 'center' });
      if (ctx.totalScore !== null) {
        doc
          .moveDown(0.3)
          .fontSize(14)
          .fillColor('#5b5f69')
          .text(`Сумарний бал: ${ctx.totalScore.toFixed(2)}`, {
            align: 'center',
          });
      }
    }

    doc
      .fontSize(11)
      .fillColor('#888')
      .text('Подяка за участь та внесок у спільноту FoldUp.', {
        align: 'center',
      });
  }

  private coverTemplateText(doc: PDFDocumentInstance): void {
    doc.save();
    doc.fillColor('#050608');
    doc.rect(240, 150, 360, 82).fill();
    doc.rect(280, 238, 300, 56).fill();
    doc.rect(324, 326, 440, 92).fill();
    doc.rect(24, 538, 250, 34).fill();
    doc.restore();
  }

  private resolveCertificateTemplatePath(): string | null {
    const candidates = [
      path.resolve(process.cwd(), '..', 'frontend', 'cert', 'A4 - 4.png'),
      path.resolve(process.cwd(), '..', 'frontend', 'cert', 'A4 - 4.pdf'),
      path.resolve(process.cwd(), '..', 'frontend', 'cert', 'A4 - 4.svg'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  private buildFilename(ctx: CertificateContext): string {
    const slug = ctx.teamName.replace(/[^a-zA-Z0-9-]+/g, '_').slice(0, 40);
    return `certificate-${slug || 'team'}.pdf`;
  }

  private parseId(value: string, fieldName: string): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return parsed;
  }
}
