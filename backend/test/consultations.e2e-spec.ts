/* istanbul ignore file */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { ConsultationsController } from '../src/consultations/consultations.controller';
import { ConsultationsService } from '../src/consultations/consultations.service';
import { ConsultationStatus } from '../src/consultations/enums/consultation-status.enum';
import { ParticipantRole } from '../src/consultations/enums/participant-role.enum';
import { ConsultationsLogger } from '../src/consultations/utils/logger';
import { PrismaService } from '../src/prisma/prisma.service';

const createPrismaMock = () => {
  const consultations = new Map<string, any>();
  const participants = new Map<string, any>();
  let consultationSequence = 1;
  let participantSequence = 1;

  const withParticipants = (consultation: any) => ({
    ...consultation,
    participants: [...participants.values()].filter(
      (participant) => participant.consultationId === consultation.id,
    ),
  });

  return {
    consultation: {
      create: jest.fn(({ data, include }) => {
        const id = `consultation-${consultationSequence++}`;
        const consultation = {
          id,
          title: data.title,
          description: data.description ?? null,
          status: ConsultationStatus.SCHEDULED,
          scheduledAt: data.scheduledAt ?? null,
          startedAt: null,
          endedAt: null,
          roomId: null,
          createdById: data.createdById,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        consultations.set(id, consultation);

        for (const item of data.participants.create) {
          const participant = {
            id: `participant-${participantSequence++}`,
            consultationId: id,
            userId: item.userId,
            role: item.role,
            joinedAt: item.joinedAt ?? null,
            leftAt: item.leftAt ?? null,
            createdAt: new Date(),
          };
          participants.set(participant.id, participant);
        }

        return Promise.resolve(include?.participants ? withParticipants(consultation) : consultation);
      }),
      findUnique: jest.fn(({ where, include }) => {
        const consultation = consultations.get(where.id) ?? null;
        if (!consultation) return Promise.resolve(null);
        return Promise.resolve(include?.participants ? withParticipants(consultation) : consultation);
      }),
      update: jest.fn(({ where, data }) => {
        const current = consultations.get(where.id);
        const updated = {
          ...current,
          ...data,
          updatedAt: new Date(),
        };
        consultations.set(where.id, updated);
        return Promise.resolve(updated);
      }),
      findMany: jest.fn(({ where, include }) => {
        const userId = where.OR[0].createdById;
        const items = [...consultations.values()]
          .filter(
            (consultation) =>
              consultation.createdById === userId ||
              [...participants.values()].some(
                (participant) =>
                  participant.consultationId === consultation.id &&
                  participant.userId === userId,
              ),
          )
          .map((consultation) =>
            include?.participants ? withParticipants(consultation) : consultation,
          )
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return Promise.resolve(items);
      }),
    },
    consultationParticipant: {
      create: jest.fn(({ data }) => {
        const participant = {
          id: `participant-${participantSequence++}`,
          consultationId: data.consultationId,
          userId: data.userId,
          role: data.role ?? ParticipantRole.PARTICIPANT,
          joinedAt: data.joinedAt ?? null,
          leftAt: data.leftAt ?? null,
          createdAt: new Date(),
        };
        participants.set(participant.id, participant);
        return Promise.resolve(participant);
      }),
      update: jest.fn(({ where, data }) => {
        const current = participants.get(where.id);
        const updated = { ...current, ...data };
        participants.set(where.id, updated);
        return Promise.resolve(updated);
      }),
      findFirst: jest.fn(({ where }) => {
        const participant =
          [...participants.values()].find(
            (item) =>
              item.consultationId === where.consultationId &&
              item.userId === where.userId,
          ) ?? null;

        return Promise.resolve(participant);
      }),
    },
  };
};

describe('Consultations (e2e)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];

  beforeAll(async () => {
    const prisma = createPrismaMock();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ConsultationsController],
      providers: [
        ConsultationsService,
        ConsultationsLogger,
        { provide: PrismaService, useValue: prisma },
      ],
    })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Parameters<typeof request>[0];
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /consultations', () => {
    it('should create consultation with host and participants', async () => {
      const response = await request(httpServer)
        .post('/consultations')
        .send({
          title: 'Team Sync',
          description: 'Weekly team meeting',
          createdById: 'user-host-1',
          participantIds: ['user-2', 'user-3'],
        })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Team Sync',
        description: 'Weekly team meeting',
        createdById: 'user-host-1',
        status: 'SCHEDULED',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.participants).toHaveLength(3); // host + 2 participants
    });

    it('should validate title is required', async () => {
      await request(httpServer)
        .post('/consultations')
        .send({
          createdById: 'user-1',
        })
        .expect(400);
    });

    it('should validate createdById is required', async () => {
      await request(httpServer)
        .post('/consultations')
        .send({
          title: 'Test',
        })
        .expect(400);
    });
  });

  describe('POST /consultations/start', () => {
    let consultationId: string;

    beforeAll(async () => {
      const response = await request(httpServer)
        .post('/consultations')
        .send({
          title: 'Start Test',
          createdById: 'user-host-2',
        })
        .expect(201);
      consultationId = response.body.id;
    });

    it('should start consultation if user is host', async () => {
      const response = await request(httpServer)
        .post('/consultations/start')
        .send({
          consultationId,
          userId: 'user-host-2',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: consultationId,
        status: 'ACTIVE',
      });
      expect(response.body.startedAt).toBeDefined();
    });

    it('should reject if user is not host', async () => {
      const response = await request(httpServer)
        .post('/consultations')
        .send({
          title: 'Access Test',
          createdById: 'user-host-3',
        })
        .expect(201);

      const newConsultationId = response.body.id;

      await request(httpServer)
        .post('/consultations/start')
        .send({
          consultationId: newConsultationId,
          userId: 'user-not-host',
        })
        .expect(403);
    });
  });

  describe('POST /consultations/join', () => {
    let consultationId: string;

    beforeAll(async () => {
      const response = await request(httpServer)
        .post('/consultations')
        .send({
          title: 'Join Test',
          createdById: 'user-host-4',
        })
        .expect(201);
      consultationId = response.body.id;
    });

    it('should add participant to consultation', async () => {
      const response = await request(httpServer)
        .post('/consultations/join')
        .send({
          consultationId,
          userId: 'user-new-participant',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        consultationId,
        userId: 'user-new-participant',
        role: 'PARTICIPANT',
      });
    });

    it('should allow participant to rejoin', async () => {
      // First join
      await request(httpServer)
        .post('/consultations/join')
        .send({
          consultationId,
          userId: 'user-rejoin',
        })
        .expect(201);

      // Rejoin
      const response = await request(httpServer)
        .post('/consultations/join')
        .send({
          consultationId,
          userId: 'user-rejoin',
        })
        .expect(201);

      expect(response.body.joinedAt).toBeDefined();
      expect(response.body.leftAt).toBeNull();
    });
  });

  describe('POST /consultations/end', () => {
    let consultationId: string;

    beforeAll(async () => {
      const response = await request(httpServer)
        .post('/consultations')
        .send({
          title: 'End Test',
          createdById: 'user-host-5',
        })
        .expect(201);
      consultationId = response.body.id;
    });

    it('should end consultation if user is host', async () => {
      const response = await request(httpServer)
        .post('/consultations/end')
        .send({
          consultationId,
          userId: 'user-host-5',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: consultationId,
        status: 'ENDED',
      });
      expect(response.body.endedAt).toBeDefined();
    });

    it('should reject if user is not host', async () => {
      const response = await request(httpServer)
        .post('/consultations')
        .send({
          title: 'End Access Test',
          createdById: 'user-host-6',
        })
        .expect(201);

      const newConsultationId = response.body.id;

      await request(httpServer)
        .post('/consultations/end')
        .send({
          consultationId: newConsultationId,
          userId: 'user-not-host',
        })
        .expect(403);
    });
  });

  describe('GET /consultations/history/:userId', () => {
    it('should return consultation history for user', async () => {
      const userId = 'user-history-test';

      // Create a consultation
      await request(httpServer)
        .post('/consultations')
        .send({
          title: 'History Test',
          createdById: userId,
        })
        .expect(201);

      // Get history
      const response = await request(httpServer)
        .get(`/consultations/history/${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        createdById: userId,
      });
    });
  });

  describe('POST /consultations/signal', () => {
    let consultationId: string;

    beforeAll(async () => {
      const response = await request(httpServer)
        .post('/consultations')
        .send({
          title: 'Signal Test',
          createdById: 'user-host-7',
        })
        .expect(201);
      consultationId = response.body.id;
    });

    it('should accept signal payload', async () => {
      const response = await request(httpServer)
        .post('/consultations/signal')
        .send({
          consultationId,
          fromUserId: 'user-1',
          toUserId: 'user-2',
          payload: { type: 'offer', sdp: 'mock-sdp' },
        })
        .expect(201);

      expect(response.body).toMatchObject({ ok: true });
    });
  });
});
