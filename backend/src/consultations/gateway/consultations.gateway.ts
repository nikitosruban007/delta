import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConsultationsService } from '../consultations.service';
import { SignalDto } from '../dto/signal.dto';
import { ConsultationsLogger } from '../utils/logger';

@WebSocketGateway({ namespace: '/consultations', cors: true })
export class ConsultationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly service: ConsultationsService, private readonly logger: ConsultationsLogger) {}

  handleConnection(client: Socket) {
    this.logger.info('Socket connected', { id: client.id });
  }

  handleDisconnect(client: Socket) {
    this.logger.info('Socket disconnected', { id: client.id });
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, payload: { consultationId: string; userId: string }) {
    const { consultationId, userId } = payload;
    client.join(consultationId);
    await this.service.joinConsultation(consultationId, userId);
    this.server.to(consultationId).emit('user_joined', { consultationId, userId });
  }

  @SubscribeMessage('leave')
  async handleLeave(client: Socket, payload: { consultationId: string; userId: string }) {
    const { consultationId, userId } = payload;
    client.leave(consultationId);
    await this.service.leaveConsultation(consultationId, userId);
    this.server.to(consultationId).emit('user_left', { consultationId, userId });
  }

  @SubscribeMessage('signal')
  async handleSignal(client: Socket, dto: SignalDto) {
    const room = dto.consultationId;
    this.logger.info('Signal exchange', { consultationId: dto.consultationId, from: dto.fromUserId, to: dto.toUserId });
    if (dto.toUserId) {
      this.server.to(room).emit('signal_exchange', dto);
    } else {
      this.server.to(room).emit('signal_exchange', dto);
    }
  }

  emitConsultationStarted(consultationId: string) {
    this.server.to(consultationId).emit('consultation_started', { consultationId });
  }

  emitConsultationEnded(consultationId: string) {
    this.server.to(consultationId).emit('consultation_ended', { consultationId });
  }
}
