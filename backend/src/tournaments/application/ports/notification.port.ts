export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');

export interface NotificationPort {
  emitToTournament(
    tournamentId: string,
    event: string,
    payload: unknown,
  ): Promise<void>;
  emitToUser(userId: string, event: string, payload: unknown): Promise<void>;
}
