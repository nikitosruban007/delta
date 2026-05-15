import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationsGateway } from './consultations.gateway';
import { ConsultationsService } from '../consultations.service';
import { ConsultationsLogger } from '../utils/logger';

describe('ConsultationsGateway (unit tests)', () => {
  let gateway: ConsultationsGateway;
  let service: ConsultationsService;
  let logger: ConsultationsLogger;

  const makeServer = () => {
    const server: any = {
      _toCalls: [] as string[],
      to: jest.fn(function (this: any, room: string) {
        server._toCalls.push(room);
        return this;
      }),
      emit: jest.fn(),
    };
    return server;
  };

  const makeSocket = (id: string) => ({
    id,
    join: jest.fn(),
    leave: jest.fn(),
    to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    emit: jest.fn(),
  });

  let mockServer: ReturnType<typeof makeServer>;
  let mockSocket: ReturnType<typeof makeSocket>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockServer = makeServer();
    mockSocket = makeSocket('socket-1');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationsGateway,
        {
          provide: ConsultationsService,
          useValue: {
            joinConsultation: jest
              .fn()
              .mockResolvedValue({ id: 'p1', userId: 'user-1' }),
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

    gateway.server = mockServer;
  });

  describe('handleConnection / handleDisconnect', () => {
    it('logs socket connect', () => {
      gateway.handleConnection(mockSocket as any);
      expect(logger.info).toHaveBeenCalledWith('Socket connected', {
        id: 'socket-1',
      });
    });

    it('logs socket disconnect and cleans up unknown sockets gracefully', () => {
      gateway.handleDisconnect(mockSocket as any);
      expect(logger.info).toHaveBeenCalledWith('Socket disconnected', {
        id: 'socket-1',
      });
    });
  });

  describe('handleJoin', () => {
    it('joins room, persists join, sends peer list to joiner, and broadcasts peer_joined to others', async () => {
      await gateway.handleJoin(mockSocket as any, {
        consultationId: 'c1',
        userId: 'user-1',
        name: 'Alice',
      });

      expect(mockSocket.join).toHaveBeenCalledWith('c1');
      expect(service.joinConsultation).toHaveBeenCalledWith('c1', 'user-1');
      // joiner gets the current peer list (empty initially, excluding self)
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'peers',
        expect.objectContaining({
          consultationId: 'c1',
          self: expect.objectContaining({
            socketId: 'socket-1',
            userId: 'user-1',
          }),
          peers: [],
        }),
      );
      // peer_joined goes to everyone in the room except the joiner
      expect(mockSocket.to).toHaveBeenCalledWith('c1');
    });

    it('exposes existing peers to a later joiner', async () => {
      // First peer
      await gateway.handleJoin(mockSocket as any, {
        consultationId: 'c1',
        userId: 'user-1',
        name: 'Alice',
      });
      // Second peer
      const second = makeSocket('socket-2');
      await gateway.handleJoin(second as any, {
        consultationId: 'c1',
        userId: 'user-2',
        name: 'Bob',
      });

      const peersCall = second.emit.mock.calls.find(
        ([event]) => event === 'peers',
      );
      expect(peersCall).toBeDefined();
      const payload = peersCall![1];
      expect(payload.peers).toHaveLength(1);
      expect(payload.peers[0]).toMatchObject({
        socketId: 'socket-1',
        userId: 'user-1',
      });
    });
  });

  describe('handleLeave', () => {
    it('removes socket from room, persists leave, broadcasts peer_left', async () => {
      await gateway.handleJoin(mockSocket as any, {
        consultationId: 'c1',
        userId: 'user-1',
      });
      jest.clearAllMocks();

      await gateway.handleLeave(mockSocket as any, {
        consultationId: 'c1',
        userId: 'user-1',
      });

      expect(mockSocket.leave).toHaveBeenCalledWith('c1');
      expect(service.leaveConsultation).toHaveBeenCalledWith('c1', 'user-1');
      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith('peer_left', {
        socketId: 'socket-1',
        userId: 'user-1',
      });
    });
  });

  describe('handleSignal', () => {
    beforeEach(async () => {
      await gateway.handleJoin(mockSocket as any, {
        consultationId: 'c1',
        userId: 'user-1',
      });
      jest.clearAllMocks();
    });

    it('targets a specific socket when toSocketId is provided', () => {
      const dto = {
        consultationId: 'c1',
        fromUserId: 'user-1',
        toSocketId: 'socket-9',
        payload: { kind: 'offer' },
      };
      gateway.handleSignal(mockSocket as any, dto);

      expect(mockServer.to).toHaveBeenCalledWith('socket-9');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'signal_exchange',
        expect.objectContaining({
          fromSocketId: 'socket-1',
          toSocketId: 'socket-9',
        }),
      );
    });

    it('targets the room when no target socket can be resolved', () => {
      const dto = {
        consultationId: 'c1',
        fromUserId: 'user-1',
        payload: { kind: 'offer' },
      };
      gateway.handleSignal(mockSocket as any, dto);

      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'signal_exchange',
        expect.objectContaining({ fromSocketId: 'socket-1' }),
      );
    });
  });

  describe('presence/reaction/chat', () => {
    beforeEach(async () => {
      await gateway.handleJoin(mockSocket as any, {
        consultationId: 'c1',
        userId: 'user-1',
        name: 'Alice',
      });
      jest.clearAllMocks();
    });

    it('broadcasts presence updates and merges patch onto stored presence', () => {
      gateway.handlePresence(mockSocket as any, {
        consultationId: 'c1',
        patch: { micOn: false, handRaised: true },
      });

      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'peer_presence',
        expect.objectContaining({
          socketId: 'socket-1',
          userId: 'user-1',
          presence: expect.objectContaining({
            micOn: false,
            handRaised: true,
            camOn: true, // unchanged keys retained
          }),
        }),
      );
    });

    it('ignores presence updates from unknown sockets', () => {
      const stranger = makeSocket('socket-x');
      gateway.handlePresence(stranger as any, {
        consultationId: 'c1',
        patch: { micOn: false },
      });
      expect(mockServer.emit).not.toHaveBeenCalled();
    });

    it('broadcasts reactions and truncates emoji length', () => {
      gateway.handleReaction(mockSocket as any, {
        consultationId: 'c1',
        emoji: '👍extra-stuff',
      });
      expect(mockServer.emit).toHaveBeenCalledWith(
        'reaction',
        expect.objectContaining({
          userId: 'user-1',
          emoji: expect.any(String),
        }),
      );
      const emoji = (mockServer.emit as jest.Mock).mock.calls[0][1].emoji;
      expect(emoji.length).toBeLessThanOrEqual(8);
    });

    it('drops empty reactions', () => {
      gateway.handleReaction(mockSocket as any, {
        consultationId: 'c1',
        emoji: '',
      });
      expect(mockServer.emit).not.toHaveBeenCalled();
    });

    it('broadcasts chat messages and trims text', () => {
      gateway.handleChat(mockSocket as any, {
        consultationId: 'c1',
        text: '  hello  ',
      });
      expect(mockServer.emit).toHaveBeenCalledWith(
        'chat_message',
        expect.objectContaining({
          userId: 'user-1',
          name: 'Alice',
          text: 'hello',
        }),
      );
    });

    it('drops empty chat messages', () => {
      gateway.handleChat(mockSocket as any, {
        consultationId: 'c1',
        text: '   ',
      });
      expect(mockServer.emit).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle emitters', () => {
    it('emits consultation_started to room', () => {
      gateway.emitConsultationStarted('c1');
      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith('consultation_started', {
        consultationId: 'c1',
      });
    });

    it('emits consultation_ended to room', () => {
      gateway.emitConsultationEnded('c1');
      expect(mockServer.to).toHaveBeenCalledWith('c1');
      expect(mockServer.emit).toHaveBeenCalledWith('consultation_ended', {
        consultationId: 'c1',
      });
    });
  });
});
