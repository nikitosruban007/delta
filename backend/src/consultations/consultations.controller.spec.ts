import { Test, TestingModule } from '@nestjs/testing';
const request = require('supertest');
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsLogger } from './utils/logger';

describe('ConsultationsController (e2e - mocked service)', () => {
  let app: INestApplication;

  const mockService = {
    createConsultation: jest.fn((dto) => Promise.resolve({ id: 'c1', ...dto })),
    startConsultation: jest.fn((id, userId) => {
      if (userId !== 'host-1') throw new (require('@nestjs/common').ForbiddenException)();
      return Promise.resolve({ id, status: 'ACTIVE' });
    }),
    joinConsultation: jest.fn((id, userId) => Promise.resolve({ id: 'p1', consultationId: id, userId })),
    endConsultation: jest.fn((id, userId) => {
      if (userId !== 'host-1') throw new (require('@nestjs/common').ForbiddenException)();
      return Promise.resolve({ id, status: 'ENDED' });
    }),
    getHistoryForUser: jest.fn((userId) => Promise.resolve([{ id: 'c1', createdById: userId }])),
    emitSignalPlaceholder: jest.fn(() => Promise.resolve(true)),
  };
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ConsultationsController],
      providers: [
        { provide: ConsultationsLogger, useValue: mockLogger },
        { provide: ConsultationsService, useValue: mockService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/consultations (POST) create', async () => {
    const payload = { title: 'Test', createdById: 'host-1' };
    await request(app.getHttpServer()).post('/consultations').send(payload).expect(201).expect((res) => {
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Test');
    });
  });

  it('/consultations/start (POST) forbidden for non-host', async () => {
    const payload = { consultationId: 'c1', userId: 'not-host' };
    await request(app.getHttpServer()).post('/consultations/start').send(payload).expect(403);
  });

  it('/consultations/start (POST) allowed for host', async () => {
    const payload = { consultationId: 'c1', userId: 'host-1' };
    await request(app.getHttpServer()).post('/consultations/start').send(payload).expect(201).expect((res) => {
      expect(res.body.status).toBe('ACTIVE');
    });
  });

  it('/consultations/join (POST) join', async () => {
    const payload = { consultationId: 'c1', userId: 'user-1' };
    await request(app.getHttpServer()).post('/consultations/join').send(payload).expect(201).expect((res) => {
      expect(res.body.userId).toBe('user-1');
    });
  });

  it('/consultations/end (POST) forbidden for non-host', async () => {
    const payload = { consultationId: 'c1', userId: 'user-1' };
    await request(app.getHttpServer()).post('/consultations/end').send(payload).expect(403);
  });

  it('/consultations/end (POST) allowed for host', async () => {
    const payload = { consultationId: 'c1', userId: 'host-1' };
    await request(app.getHttpServer()).post('/consultations/end').send(payload).expect(201).expect((res) => {
      expect(res.body.status).toBe('ENDED');
    });
  });

  it('/consultations/signal (POST) exchange', async () => {
    const payload = { consultationId: 'c1', fromUserId: 'user-1', payload: { type: 'offer' } };
    await request(app.getHttpServer()).post('/consultations/signal').send(payload).expect(201).expect((res) => {
      expect(res.body.ok).toBe(true);
    });
  });

  it('/consultations/history/:userId (GET) get history', async () => {
    await request(app.getHttpServer()).get('/consultations/history/user-1').expect(200).expect((res) => {
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]?.id).toBe('c1');
    });
  });

  describe('error handling', () => {
    it('should handle create consultation errors', async () => {
      mockService.createConsultation.mockRejectedValueOnce(new Error('DB error'));
      const payload = { title: 'Test', createdById: 'host-1' };
      await request(app.getHttpServer()).post('/consultations').send(payload).expect(500);
    });

    it('should handle start consultation not found', async () => {
      mockService.startConsultation.mockRejectedValueOnce(
        new (require('@nestjs/common').NotFoundException)('Consultation not found')
      );
      const payload = { consultationId: 'invalid-id', userId: 'host-1' };
      await request(app.getHttpServer()).post('/consultations/start').send(payload).expect(404);
    });

    it('should handle join consultation not found', async () => {
      mockService.joinConsultation.mockRejectedValueOnce(
        new (require('@nestjs/common').NotFoundException)('Consultation not found')
      );
      const payload = { consultationId: 'invalid-id', userId: 'user-1' };
      await request(app.getHttpServer()).post('/consultations/join').send(payload).expect(404);
    });

    it('should handle end consultation not found', async () => {
      mockService.endConsultation.mockRejectedValueOnce(
        new (require('@nestjs/common').NotFoundException)('Consultation not found')
      );
      const payload = { consultationId: 'invalid-id', userId: 'host-1' };
      await request(app.getHttpServer()).post('/consultations/end').send(payload).expect(404);
    });

    it('should handle signal endpoint errors', async () => {
      mockService.emitSignalPlaceholder.mockRejectedValueOnce(new Error('Signal error'));
      const payload = { consultationId: 'c1', fromUserId: 'user-1', payload: {} };
      await request(app.getHttpServer()).post('/consultations/signal').send(payload).expect(500);
    });

    it('should handle get history errors', async () => {
      mockService.getHistoryForUser.mockRejectedValueOnce(new Error('DB error'));
      await request(app.getHttpServer()).get('/consultations/history/user-1').expect(500);
    });
  });
});
