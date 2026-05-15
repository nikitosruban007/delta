import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConsultationsService } from '../consultations.service';
import { SignalDto } from '../dto/signal.dto';
import { ConsultationsLogger } from '../utils/logger';

type PresenceState = {
  micOn: boolean;
  camOn: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  name: string | null;
};

type PeerEntry = {
  socketId: string;
  userId: string;
  consultationId: string;
  presence: PresenceState;
};

const defaultPresence = (name: string | null): PresenceState => ({
  micOn: true,
  camOn: true,
  screenSharing: false,
  handRaised: false,
  name,
});

@WebSocketGateway({ namespace: '/consultations', cors: true })
export class ConsultationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  // socketId -> peer entry
  private readonly peersBySocket = new Map<string, PeerEntry>();
  // consultationId -> Set<socketId>
  private readonly roomPeers = new Map<string, Set<string>>();

  constructor(
    private readonly service: ConsultationsService,
    private readonly logger: ConsultationsLogger,
  ) {}

  handleConnection(client: Socket) {
    this.logger.info('Socket connected', { id: client.id });
  }

  handleDisconnect(client: Socket) {
    const entry = this.peersBySocket.get(client.id);
    this.peersBySocket.delete(client.id);
    if (entry) {
      this.removeFromRoom(entry.consultationId, client.id);
      this.server
        .to(entry.consultationId)
        .emit('peer_left', { socketId: client.id, userId: entry.userId });
    }
    this.logger.info('Socket disconnected', { id: client.id });
  }

  @SubscribeMessage('join')
  async handleJoin(
    client: Socket,
    payload: {
      consultationId: string;
      userId: string;
      name?: string | null;
    },
  ) {
    const { consultationId, userId } = payload;
    const name = payload.name ?? null;

    client.join(consultationId);

    const entry: PeerEntry = {
      socketId: client.id,
      userId,
      consultationId,
      presence: defaultPresence(name),
    };
    this.peersBySocket.set(client.id, entry);
    this.addToRoom(consultationId, client.id);

    await this.service.joinConsultation(consultationId, userId);

    // Build current peer list (excluding the joiner) so the new client can
    // initiate offers towards each existing peer.
    const existingPeers = this.listPeers(consultationId).filter(
      (p) => p.socketId !== client.id,
    );

    // Send the current peer list to the joiner only.
    client.emit('peers', {
      consultationId,
      self: { socketId: client.id, userId, presence: entry.presence },
      peers: existingPeers.map((p) => ({
        socketId: p.socketId,
        userId: p.userId,
        presence: p.presence,
      })),
    });

    // Notify others that a new peer joined.
    client.to(consultationId).emit('peer_joined', {
      socketId: client.id,
      userId,
      presence: entry.presence,
    });
  }

  @SubscribeMessage('leave')
  async handleLeave(
    client: Socket,
    payload: { consultationId: string; userId: string },
  ) {
    const { consultationId, userId } = payload;
    client.leave(consultationId);
    this.peersBySocket.delete(client.id);
    this.removeFromRoom(consultationId, client.id);

    await this.service.leaveConsultation(consultationId, userId);

    this.server
      .to(consultationId)
      .emit('peer_left', { socketId: client.id, userId });
  }

  @SubscribeMessage('signal')
  handleSignal(client: Socket, dto: SignalDto & { toSocketId?: string }) {
    this.logger.info('Signal exchange', {
      consultationId: dto.consultationId,
      from: dto.fromUserId,
      to: dto.toUserId ?? dto.toSocketId ?? '*',
    });

    // Always carry sender's socketId so peers can match by socket, not just userId
    const envelope = { ...dto, fromSocketId: client.id };

    if (dto.toSocketId) {
      this.server.to(dto.toSocketId).emit('signal_exchange', envelope);
      return;
    }
    if (dto.toUserId) {
      // Look up the target socket within the room
      const target = this.listPeers(dto.consultationId).find(
        (p) => p.userId === dto.toUserId,
      );
      if (target) {
        this.server.to(target.socketId).emit('signal_exchange', envelope);
        return;
      }
    }
    // Fallback: broadcast within room (legacy behaviour)
    this.server.to(dto.consultationId).emit('signal_exchange', envelope);
  }

  @SubscribeMessage('presence_update')
  handlePresence(
    client: Socket,
    payload: {
      consultationId: string;
      patch: Partial<PresenceState>;
    },
  ) {
    const entry = this.peersBySocket.get(client.id);
    if (!entry || entry.consultationId !== payload.consultationId) return;
    entry.presence = { ...entry.presence, ...payload.patch };
    this.server.to(payload.consultationId).emit('peer_presence', {
      socketId: client.id,
      userId: entry.userId,
      presence: entry.presence,
    });
  }

  @SubscribeMessage('reaction')
  handleReaction(
    client: Socket,
    payload: { consultationId: string; emoji: string },
  ) {
    const entry = this.peersBySocket.get(client.id);
    if (!entry || entry.consultationId !== payload.consultationId) return;
    const trimmed = String(payload.emoji ?? '').slice(0, 8);
    if (!trimmed) return;
    this.server.to(payload.consultationId).emit('reaction', {
      socketId: client.id,
      userId: entry.userId,
      emoji: trimmed,
      at: Date.now(),
    });
  }

  @SubscribeMessage('chat_message')
  handleChat(
    client: Socket,
    payload: { consultationId: string; text: string },
  ) {
    const entry = this.peersBySocket.get(client.id);
    if (!entry || entry.consultationId !== payload.consultationId) return;
    const text = String(payload.text ?? '')
      .slice(0, 1000)
      .trim();
    if (!text) return;
    this.server.to(payload.consultationId).emit('chat_message', {
      socketId: client.id,
      userId: entry.userId,
      name: entry.presence.name,
      text,
      at: Date.now(),
    });
  }

  emitConsultationStarted(consultationId: string) {
    this.server
      .to(consultationId)
      .emit('consultation_started', { consultationId });
  }

  emitConsultationEnded(consultationId: string) {
    this.server
      .to(consultationId)
      .emit('consultation_ended', { consultationId });
  }

  // ─── internal helpers ────────────────────────────────────────────────────────

  private addToRoom(consultationId: string, socketId: string) {
    let set = this.roomPeers.get(consultationId);
    if (!set) {
      set = new Set();
      this.roomPeers.set(consultationId, set);
    }
    set.add(socketId);
  }

  private removeFromRoom(consultationId: string, socketId: string) {
    const set = this.roomPeers.get(consultationId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) this.roomPeers.delete(consultationId);
  }

  private listPeers(consultationId: string): PeerEntry[] {
    const set = this.roomPeers.get(consultationId);
    if (!set) return [];
    const out: PeerEntry[] = [];
    for (const sid of set) {
      const e = this.peersBySocket.get(sid);
      if (e) out.push(e);
    }
    return out;
  }
}
