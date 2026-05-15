import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

const TICK_MS = 60_000; // every minute

@Injectable()
export class TournamentStatusScheduler
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(TournamentStatusScheduler.name);
  private handle: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    if (process.env.DISABLE_TOURNAMENT_SCHEDULER === '1') return;
    this.handle = setInterval(() => {
      void this.tick();
    }, TICK_MS);
    void this.tick();
  }

  onModuleDestroy() {
    if (this.handle) clearInterval(this.handle);
  }

  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      const now = new Date();

      // draft → registration: if starts_at minus registration window (we use: registration_deadline in future and starts_at in future)
      // We auto-open registration only if registration_deadline is set and is in the future
      // and starts_at is also in the future. Organizers can still publish manually.
      await this.prisma.tournaments.updateMany({
        where: {
          status: 'draft',
          registration_deadline: { gt: now },
          starts_at: { gt: now },
        },
        data: { status: 'registration' },
      });

      // registration → active: once registration_deadline has passed and starts_at <= now
      await this.prisma.tournaments.updateMany({
        where: {
          status: 'registration',
          OR: [
            { registration_deadline: { lte: now } },
            { starts_at: { lte: now } },
          ],
        },
        data: { status: 'active' },
      });

      // active → finished: ends_at has passed
      await this.prisma.tournaments.updateMany({
        where: {
          status: 'active',
          ends_at: { lte: now },
        },
        data: { status: 'finished' },
      });
    } catch (err) {
      this.logger.error('Status scheduler tick failed', err as Error);
    } finally {
      this.running = false;
    }
  }
}
