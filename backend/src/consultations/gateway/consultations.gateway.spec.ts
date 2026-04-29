import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationsGateway } from './consultations.gateway';
import { ConsultationsService } from '../consultations.service';
import { ConsultationsLogger } from '../utils/logger';

describe('ConsultationsGateway (unit tests)', () => {
  let gateway: ConsultationsGateway;
  let service: ConsultationsService;
  let logger: ConsultationsLogger;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-1',
    join: jest.fn(),
    leave: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationsGateway,
        {
          provide: ConsultationsService,
          useValue: {
            joinConsultation: jest.fn().mockResolvedValue({ id: 'p1', userId: 'user-1' }),
            leaveConsultation: jest.fn().mockResolvedValue({ id: 'p1' }),
          },
        },
        {
          provide: ConsultationsLogger,
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<ConsultationsGateway>(ConsultationsGateway);
    service = module.get<ConsultationsService>(ConsultationsService);
    logger = module.get<ConsultationsLogger>(ConsultationsLogger);

    gateway.server = mockServer as any;
  });

  describe('handleConnection', () => {
    it('should log when socket connects', () => {
      gateway.handleConnection(mockSocket as any);

      expect(logger.info).toHaveBeenCalledWith('Socket connected', { id: 'socket-1' });
    });
  });

  describe('handleDisconnect', () => {
    it('should log when socket disconnects', () => {
      gateway.handleDisconnect(mockSocket as any);

      expect(logger.info).toHaveBeenCalledWith('Socket disconnected', { id: 'socket-1' });
    });
  });

  describe('handleJoin', () => {
    it('should add socket to room and call service', async () => {
      const payload = { consultationId: 'c1', userId: 'user-1' };

      await gateway.handleJoin(mockSocket as any, payload);

      expect(mockSocket.join).toHaveBeenCalledWith('c1');
      expect(service.joinConsultation).toHaveBeenCalledWith('c1', 'user-1');
      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith('user_joined', { consultationId: 'c1', userId: 'user-1' });
    });
  });

  describe('handleLeave', () => {
    it('should remove socket from room and call service', async () => {
      const payload = { consultationId: 'c1', userId: 'user-1' };

      await gateway.handleLeave(mockSocket as any, payload);

      expect(mockSocket.leave).toHaveBeenCalledWith('c1');
      expect(service.leaveConsultation).toHaveBeenCalledWith('c1', 'user-1');
      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith('user_left', { consultationId: 'c1', userId: 'user-1' });
    });
  });

  describe('handleSignal', () => {
    it('should broadcast signal to room', async () => {
      const dto = { consultationId: 'c1', fromUserId: 'user-1', toUserId: 'user-2', payload: { type: 'offer' } };

      await gateway.handleSignal(mockSocket as any, dto);

      expect(logger.info).toHaveBeenCalledWith('Signal exchange', expect.any(Object));
      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith('signal_exchange', dto);
    });

    it('should broadcast signal without toUserId', async () => {
      const dto = { consultationId: 'c1', fromUserId: 'user-1', payload: { type: 'offer' } };

      await gateway.handleSignal(mockSocket as any, dto);

      expect(mockServer.emit).toHaveBeenCalledWith('signal_exchange', dto);
    });
  });

  describe('emitConsultationStarted', () => {
    it('should emit consultation_started event to room', () => {
      gateway.emitConsultationStarted('c1');

      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith('consultation_started', { consultationId: 'c1' });
    });
  });

  describe('emitConsultationEnded', () => {
    it('should emit consultation_ended event to room', () => {
      gateway.emitConsultationEnded('c1');

      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith('consultation_ended', { consultationId: 'c1' });
    });
  });
});
