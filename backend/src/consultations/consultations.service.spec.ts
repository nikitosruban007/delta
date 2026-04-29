import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationsLogger } from './utils/logger';
import { PrismaService } from '../prisma/prisma.service';

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
      const dto = { title: 'Test', createdById: 'user-1', participantIds: ['user-2', 'user-3'] };
      const expected = { id: 'c1', ...dto, participants: [] };

      mockPrisma.consultation.create.mockResolvedValue(expected);

      const result = await service.createConsultation(dto);

      expect(result).toEqual(expected);
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
      const dto = { title: 'Test', createdById: 'user-1' };
      mockPrisma.consultation.create.mockResolvedValue({ id: 'c1', ...dto });

      await service.createConsultation(dto);
      expect(mockPrisma.consultation.create).toHaveBeenCalled();
    });
  });

  describe('startConsultation', () => {
    it('should start consultation if user is host', async () => {
      const consultation = { id: 'c1', createdById: 'host-1', status: 'SCHEDULED' };
      mockPrisma.consultation.findUnique.mockResolvedValue(consultation);
      mockPrisma.consultation.update.mockResolvedValue({ ...consultation, status: 'ACTIVE' });

      const result = await service.startConsultation('c1', 'host-1');

      expect(result.status).toBe('ACTIVE');
      expect(logger.info).toHaveBeenCalledWith('Consultation started', expect.any(Object));
    });

    it('should throw ForbiddenException if user is not host', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', createdById: 'host-1' });

      await expect(service.startConsultation('c1', 'user-2')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if consultation not found', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue(null);

      await expect(service.startConsultation('c1', 'any-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('joinConsultation', () => {
    it('should add new participant', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', participants: [] });
      mockPrisma.consultationParticipant.create.mockResolvedValue({ id: 'p1', userId: 'user-2' });

      const result = await service.joinConsultation('c1', 'user-2');

      expect(result.userId).toBe('user-2');
      expect(mockPrisma.consultationParticipant.create).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('User joined consultation', expect.any(Object));
    });

    it('should rejoin existing participant', async () => {
      const existing = { id: 'p1', userId: 'user-2', leftAt: new Date() };
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', participants: [existing] });
      mockPrisma.consultationParticipant.update.mockResolvedValue({ ...existing, joinedAt: new Date(), leftAt: null });

      await service.joinConsultation('c1', 'user-2');

      expect(mockPrisma.consultationParticipant.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if consultation not found', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue(null);

      await expect(service.joinConsultation('c1', 'user-2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('leaveConsultation', () => {
    it('should mark participant as left', async () => {
      const participant = { id: 'p1', userId: 'user-2' };
      mockPrisma.consultationParticipant.findFirst.mockResolvedValue(participant);
      mockPrisma.consultationParticipant.update.mockResolvedValue({ ...participant, leftAt: new Date() });

      const result = await service.leaveConsultation('c1', 'user-2');

      expect(result).not.toBeNull();
      expect(result?.leftAt).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith('User left consultation', expect.any(Object));
    });

    it('should return null if participant not found', async () => {
      mockPrisma.consultationParticipant.findFirst.mockResolvedValue(null);

      const result = await service.leaveConsultation('c1', 'user-2');

      expect(result).toBeNull();
    });
  });

  describe('endConsultation', () => {
    it('should end consultation if user is host', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', createdById: 'host-1' });
      mockPrisma.consultation.update.mockResolvedValue({ id: 'c1', status: 'ENDED' });

      const result = await service.endConsultation('c1', 'host-1');

      expect(result.status).toBe('ENDED');
      expect(logger.info).toHaveBeenCalledWith('Consultation ended', expect.any(Object));
    });

    it('should throw ForbiddenException if user is not host', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue({ id: 'c1', createdById: 'host-1' });

      await expect(service.endConsultation('c1', 'user-2')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if consultation not found', async () => {
      mockPrisma.consultation.findUnique.mockResolvedValue(null);

      await expect(service.endConsultation('c1', 'any-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHistoryForUser', () => {
    it('should return consultations where user is creator or participant', async () => {
      const consultations = [{ id: 'c1', createdById: 'user-1' }];
      mockPrisma.consultation.findMany.mockResolvedValue(consultations);

      const result = await service.getHistoryForUser('user-1');

      expect(result).toEqual(consultations);
      expect(mockPrisma.consultation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('emitSignalPlaceholder', () => {
    it('should return true', async () => {
      const result = await service.emitSignalPlaceholder();

      expect(result).toBe(true);
    });
  });

  describe('edge cases and branch coverage', () => {
    it('should create with all participantIds including createdById', async () => {
      const dto = { title: 'Test', createdById: 'user-1', participantIds: ['user-1', 'user-2', 'user-3'] };
      mockPrisma.consultation.create.mockResolvedValue({ id: 'c1', ...dto });

      await service.createConsultation(dto);

      const callArgs = mockPrisma.consultation.create.mock.calls[0][0];
      const participants = callArgs.data.participants.create;
      
      expect(Array.isArray(participants)).toBe(true);
      expect(participants.length).toBeGreaterThan(0);
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
      const dto = { title: 'Scheduled', createdById: 'user-1', scheduledAt: scheduledTime.toISOString() };
      mockPrisma.consultation.create.mockResolvedValue({ id: 'c1', ...dto });

      await service.createConsultation(dto);

      const callArgs = mockPrisma.consultation.create.mock.calls[0][0];
      expect(callArgs.data.scheduledAt).toEqual(expect.any(Date));
    });

    it('createConsultation should set scheduledAt as undefined when not provided', async () => {
      const dto = { title: 'No Schedule', createdById: 'user-1' };
      mockPrisma.consultation.create.mockResolvedValue({ id: 'c1', ...dto });

      await service.createConsultation(dto);

      const callArgs = mockPrisma.consultation.create.mock.calls[0][0];
      expect(callArgs.data.scheduledAt).toBeUndefined();
    });
  });
});
