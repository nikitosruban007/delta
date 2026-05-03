import { Injectable } from '@nestjs/common';
import { NotificationPort } from '../../application/ports/notification.port';

@Injectable()
export class TournamentWsGateway implements NotificationPort {
  async emitToTournament(tournamentId: string, event: string, payload: unknown): Promise<void> {
    // Socket.IO room emit should be wired here in real app
    void tournamentId;
    void event;
    void payload;
  }

  async emitToUser(userId: string, event: string, payload: unknown): Promise<void> {
    // Socket.IO direct emit should be wired here in real app
    void userId;
    void event;
    void payload;
  }
}
