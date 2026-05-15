import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications/notifications.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './identity/identity.module';
import { ForumsModule } from './forums';
import { ExportModule } from './export/export.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { ResultsModule } from './results/results.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { SearchModule } from './search/search.module';
import { CertificatesModule } from './certificates/certificates.module';

@Module({
  imports: [
    PrismaModule,
    IdentityModule,
    NotificationsModule,
    ConsultationsModule,
    ForumsModule,
    TournamentsModule,
    LeaderboardModule,
    ResultsModule,
    ExportModule,
    SearchModule,
    CertificatesModule,
  ],
})
export class AppModule {}
