import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TournamentsModule } from '../../tournaments.module';

describe('TournamentsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TournamentsModule],
    }).compile();

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
