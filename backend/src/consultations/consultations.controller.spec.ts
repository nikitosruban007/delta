import { Test, TestingModule } from '@nestjs/testing';
const request = require('supertest');
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsLogger } from './utils/logger';
import { JwtAuthGuard } from '../identity/presentation/guards/jwt-auth.guard';

const TEST_USER = { id: 'host-1', email: 'host@test.com', roles: [], permissions: [] };

describe('ConsultationsController (e2e - mocked service)', () => {
  let app: INestApplication;

  const mockService = {
    createConsultation: jest.fn((dto: any, userId: string) => Promise.resolve({ id: 'c1', title: dto.title, createdById: userId })),
    startConsultation: jest.fn((id: string, userId: string) => Promise.resolve({ id, status: 'ACTIVE', createdById: userId })),
    joinConsultation: jest.fn((id: string, userId: string) => Promise.resolve({ id: 'p1', consultationId: id, userId })),
    endConsultation: jest.fn((id: string, userId: string) => Promise.resolve({ id, status: 'ENDED', createdById: userId })),
    getHistoryForUser: jest.fn((userId: string) => Promise.resolve([{ id: 'c1', createdById: userId }])),
    getById: jest.fn((id: string) => Promise.resolve({ id })),
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = TEST_USER;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockService.createConsultation.mockImplementation((dto: any, userId: string) =>
      Promise.resolve({ id: 'c1', title: dto.title, createdById: userId })
    );
    mockService.startConsultation.mockImplementation((id: string, userId: string) =>
      Promise.resolve({ id, status: 'ACTIVE', createdById: userId })
    );
    mockService.joinConsultation.mockImplementation((id: string, userId: string) =>
      Promise.resolve({ id: 'p1', consultationId: id, userId })
    );
    mockService.endConsultation.mockImplementation((id: string, userId: string) =>
      Promise.resolve({ id, status: 'ENDED', createdById: userId })
    );
    mockService.getHistoryForUser.mockImplementation((userId: string) =>
      Promise.resolve([{ id: 'c1', createdById: userId }])
    );
    mockService.getById.mockImplementation((id: string) => Promise.resolve({ id }));
  });

  it('/consultations (POST) create', async () => {
    await request(app.getHttpServer())
      .post('/consultations')
      .send({ title: 'Test', tournament_id: 1 })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('Test');
      });
    expect(mockService.createConsultation).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Test' }),
      TEST_USER.id,
    );
  });

  it('/consultations/start (POST) starts consultation', async () => {
    await request(app.getHttpServer())
      .post('/consultations/start')
      .send({ consultationId: 'c1' })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.status).toBe('ACTIVE');
      });
    expect(mockService.startConsultation).toHaveBeenCalledWith('c1', TEST_USER.id);
  });

  it('/consultations/join (POST) join', async () => {
    await request(app.getHttpServer())
      .post('/consultations/join')
      .send({ consultationId: 'c1' })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.userId).toBe(TEST_USER.id);
      });
  });

  it('/consultations/end (POST) ends consultation', async () => {
    await request(app.getHttpServer())
      .post('/consultations/end')
      .send({ consultationId: 'c1' })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.status).toBe('ENDED');
      });
    expect(mockService.endConsultation).toHaveBeenCalledWith('c1', TEST_USER.id);
  });

  it('/consultations/signal (POST) exchange', async () => {
    await request(app.getHttpServer())
      .post('/consultations/signal')
      .send({ consultationId: 'c1', fromUserId: TEST_USER.id, payload: { type: 'offer' } })
      .expect(201)
      .expect((res: any) => {
        expect(res.body.ok).toBe(true);
      });
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it('/consultations (GET) list mine', async () => {
    await request(app.getHttpServer())
      .get('/consultations')
      .expect(200)
      .expect((res: any) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]?.id).toBe('c1');
      });
    expect(mockService.getHistoryForUser).toHaveBeenCalledWith(TEST_USER.id);
  });

  it('/consultations/:id (GET) get by id', async () => {
    await request(app.getHttpServer())
      .get('/consultations/c1')
      .expect(200)
      .expect((res: any) => {
        expect(res.body.id).toBe('c1');
      });
    expect(mockService.getById).toHaveBeenCalledWith('c1');
  });

  describe('error handling', () => {
    it('should handle create consultation errors', async () => {
      mockService.createConsultation.mockRejectedValueOnce(new Error('DB error'));
      await request(app.getHttpServer()).post('/consultations').send({ title: 'Test', tournament_id: 1 }).expect(500);
    });

    it('should propagate ForbiddenException from service on start', async () => {
      mockService.startConsultation.mockRejectedValueOnce(
        new (require('@nestjs/common').ForbiddenException)('Not the host'),
      );
      await request(app.getHttpServer())
        .post('/consultations/start')
        .send({ consultationId: 'c1' })
        .expect(403);
    });

    it('should handle start consultation not found', async () => {
      mockService.startConsultation.mockRejectedValueOnce(
        new (require('@nestjs/common').NotFoundException)('Consultation not found'),
      );
      await request(app.getHttpServer())
        .post('/consultations/start')
        .send({ consultationId: 'invalid-id' })
        .expect(404);
    });

    it('should handle join consultation not found', async () => {
      mockService.joinConsultation.mockRejectedValueOnce(
        new (require('@nestjs/common').NotFoundException)('Consultation not found'),
      );
      await request(app.getHttpServer())
        .post('/consultations/join')
        .send({ consultationId: 'invalid-id' })
        .expect(404);
    });

    it('should propagate ForbiddenException from service on end', async () => {
      mockService.endConsultation.mockRejectedValueOnce(
        new (require('@nestjs/common').ForbiddenException)('Not the host'),
      );
      await request(app.getHttpServer())
        .post('/consultations/end')
        .send({ consultationId: 'c1' })
        .expect(403);
    });

    it('should handle end consultation not found', async () => {
      mockService.endConsultation.mockRejectedValueOnce(
        new (require('@nestjs/common').NotFoundException)('Consultation not found'),
      );
      await request(app.getHttpServer())
        .post('/consultations/end')
        .send({ consultationId: 'invalid-id' })
        .expect(404);
    });

    it('should handle list consultations errors', async () => {
      mockService.getHistoryForUser.mockRejectedValueOnce(new Error('DB error'));
      await request(app.getHttpServer()).get('/consultations').expect(500);
    });
  });
});
