import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationsLogger } from './utils/logger';
import { PrismaService } from '../prisma/prisma.service';

const mockConsultationRow = (overrides: object = {}) => ({
  id: 'c1',
  title: 'Test',
  description: null,
  status: 'SCHEDULED',
  scheduledAt: null,
  startedAt: null,
  endedAt: null,
  roomId: null,
  createdById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  participants: [],
  ...overrides,
});

describe('ConsultationsService (unit tests)', () => {
  let service: ConsultationsService;
  let logger: ConsultationsLogger;

  const mockPrisma = {
    consultation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    consultationParticipant: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ConsultationsLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<ConsultationsService>(ConsultationsService);
    logger = module.get<ConsultationsLogger>(ConsultationsLogger);
  });

  describe('createConsultation', () => {
    it('should create consultation with host and participants', async () => {
      const dto = { title: 'Test', tournament_id: 1, participantIds: ['user-2', 'user-3'] };
      const row = mockConsultationRow();
      mockPrisma.consultation.create.mockResolvedValue(row);

      const result = await service.createConsultation(dto, 'user-1');

      expect(result.id).toBe('c1');
      expect(mockPrisma.consultation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Test',
            createdById: 'user-1',
          }),
        })
      );
      expect(logger.info).toHaveBeenCalledWith('Consultation created', expect.any(Object));
    });

    it('should handle empty participantIds', async () => {
      const dto = { title: 'Test', tournament_id: 1 };
      mockPrisma.consultation.create.mockResolvedValue(mockConsultationRow());

      await service.createConsultation(dto, 'user-1');
      expect(mockPrisma.consultation.create).toHaveBeenCalled();
    });
  });

  describe('startConsultation', () => {
    it('should start consultation if user is host', async () => {
      const consultation = { id: 'c1', createdById: 'host-1', status: 'SCHEDULED' };
      mockPrisma.consultation.findUnique.mockResolvedValue(consultation);
      mockPrisma.consultation.update.mockResolvedValue(mockConsultationRow({ status: 'ACTIVE' }));

      const result = await service.startConsultation('c1', 'host-1');

      expect(mockPrisma.consultation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ACTIVE' }),
        })
      );
      expect(logger.info).toHaveBeenCalledWith('Consultation started', expect.any(Object));
    });

    it('should throw ForbiddenException if user is not host', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', createdById: 'host-1' });

      await expect(service.startConsultation('c1', 'not-host')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if consultation not found', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue(null);

      await expect(service.startConsultation('c1', 'host-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('joinConsultation', () => {
    it('should create participant if not already joined', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', participants: [] });
      mockPrisma.consultationParticipant.create.mockResolvedValue({ id: 'p1', userId: 'user-2' });

      await service.joinConsultation('c1', 'user-2');

      expect(mockPrisma.consultationParticipant.create).toHaveBeenCalled();
    });

    it('should update joinedAt if already joined', async () => {
      const existing = { id: 'p1', userId: 'user-2', leftAt: null };
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', participants: [existing] });
      mockPrisma.consultationParticipant.update.mockResolvedValue({ ...existing, joinedAt: new Date() });

      await service.joinConsultation('c1', 'user-2');

      expect(mockPrisma.consultationParticipant.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if consultation not found', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue(null);

      await expect(service.joinConsultation('c1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('leaveConsultation', () => {
    it('should update leftAt for participant', async () => {
      const participant = { id: 'p1', userId: 'user-1' };
      mockPrisma.consultationParticipant.findFirst.mockResolvedValue(participant);
      mockPrisma.consultationParticipant.update.mockResolvedValue({ ...participant, leftAt: new Date() });

      await service.leaveConsultation('c1', 'user-1');

      expect(mockPrisma.consultationParticipant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ leftAt: expect.any(Date) }),
        })
      );
    });

    it('should return null if participant not found', async () => {
      mockPrisma.consultationParticipant.findFirst.mockResolvedValue(null);

      const result = await service.leaveConsultation('c1', 'user-999');

      expect(result).toBeNull();
    });
  });

  describe('endConsultation', () => {
    it('should end consultation if user is host', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', createdById: 'host-1' });
      mockPrisma.consultation.update.mockResolvedValue(mockConsultationRow({ status: 'ENDED' }));

      await service.endConsultation('c1', 'host-1');

      expect(mockPrisma.consultation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'ENDED' }),
        })
      );
    });

    it('should throw ForbiddenException if not host', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', createdById: 'host-1' });

      await expect(service.endConsultation('c1', 'not-host')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue(null);

      await expect(service.endConsultation('c1', 'host-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHistoryForUser', () => {
    it('should return consultations for user', async () => {
      const rows = [mockConsultationRow()];
      mockPrisma.consultation.findMany.mockResolvedValue(rows);

      const result = await service.getHistoryForUser('user-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.consultation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        })
      );
    });
  });

  describe('edge cases and branch coverage', () => {
    it('should create with all participantIds including createdById (filter self)', async () => {
      const dto = { title: 'Test', tournament_id: 1, participantIds: ['user-1', 'user-2', 'user-3'] };
      mockPrisma.consultation.create.mockResolvedValue(mockConsultationRow());

      await service.createConsultation(dto, 'user-1');

      const callArgs = mockPrisma.consultation.create.mock.calls[0][0];
      const participants = callArgs.data.participants.create;

      expect(Array.isArray(participants)).toBe(true);
      // user-1 is host, so it should not appear twice in participants
      const nonHostParticipants = participants.filter((p: any) => p.role !== 'HOST');
      expect(nonHostParticipants.every((p: any) => p.userId !== 'user-1')).toBe(true);
    });

    it('should handle rejoin with leftAt set', async () => {
      const existing = { id: 'p1', userId: 'user-2', leftAt: new Date() };
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', participants: [existing] });
      mockPrisma.consultationParticipant.update.mockResolvedValue({ ...existing, joinedAt: new Date(), leftAt: null });

      await service.joinConsultation('c1', 'user-2');

      expect(mockPrisma.consultationParticipant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ leftAt: null }),
        })
      );
    });

    it('should handle leave with no participant found', async () => {
      mockPrisma.consultationParticipant.findFirst.mockResolvedValue(null);

      const result = await service.leaveConsultation('c1', 'user-999');

      expect(result).toBeNull();
      expect(mockPrisma.consultationParticipant.update).not.toHaveBeenCalled();
    });

    it('createConsultation should set scheduledAt when provided', async () => {
      const scheduledTime = new Date('2026-05-01T10:00:00');
      const dto = { title: 'Scheduled', tournament_id: 1, scheduledAt: scheduledTime.toISOString() };
      mockPrisma.consultation.create.mockResolvedValue(mockConsultationRow());

      await service.createConsultation(dto, 'user-1');

      const callArgs = mockPrisma.consultation.create.mock.calls[0][0];
      expect(callArgs.data.scheduledAt).toEqual(expect.any(Date));
    });

    it('createConsultation should set scheduledAt as undefined when not provided', async () => {
      const dto = { title: 'No Schedule', tournament_id: 1 };
      mockPrisma.consultation.create.mockResolvedValue(mockConsultationRow());

      await service.createConsultation(dto, 'user-1');

      const callArgs = mockPrisma.consultation.create.mock.calls[0][0];
      expect(callArgs.data.scheduledAt).toBeUndefined();
    });
  });
});
