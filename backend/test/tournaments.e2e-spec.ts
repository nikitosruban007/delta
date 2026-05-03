/* istanbul ignore file */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TournamentsModule } from '../src/tournaments/tournaments.module';
import { OrganizerGuard } from '../src/tournaments/presentation/guards/organizer.guard';

describe('TournamentsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TournamentsModule],
    })
      .overrideGuard(OrganizerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/tournaments (POST)', async () => {
    await request(app.getHttpServer())
      .post('/tournaments')
      .send({ title: 'Demo tournament' })
      .expect(201);
  });
});
