import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../src/identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../src/identity/presentation/guards/roles.guard';
import { ForumsController } from '../src/forums/forums.controller';
import { ForumsService } from '../src/forums/forums.service';

describe('ForumsController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];

  const forumsService = {
    listCategories: jest.fn(),
    getCategory: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    listTopics: jest.fn(),
    getTopic: jest.fn(),
    createTopic: jest.fn(),
    updateTopic: jest.fn(),
    deleteTopic: jest.fn(),
    listPosts: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ForumsController],
      providers: [{ provide: ForumsService, useValue: forumsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          context.switchToHttp().getRequest().user = {
            id: '7',
            roles: ['Admin'],
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('routes category endpoints to the forum service', async () => {
    forumsService.listCategories.mockResolvedValue([{ id: 1, title: 'General' }]);
    forumsService.getCategory.mockResolvedValue({ id: 1, title: 'General' });
    forumsService.createCategory.mockResolvedValue({ id: 2, title: 'News' });
    forumsService.updateCategory.mockResolvedValue({ id: 2, title: 'Updates' });
    forumsService.deleteCategory.mockResolvedValue({ id: 2, deleted: true });

    await request(httpServer).get('/forums/categories').expect(200, [
      { id: 1, title: 'General' },
    ]);
    await request(httpServer).get('/forums/categories/1').expect(200, {
      id: 1,
      title: 'General',
    });
    await request(httpServer)
      .post('/forums/categories')
      .send({ title: 'News' })
      .expect(201, { id: 2, title: 'News' });
    await request(httpServer)
      .patch('/forums/categories/2')
      .send({ title: 'Updates' })
      .expect(200, { id: 2, title: 'Updates' });
    await request(httpServer).delete('/forums/categories/2').expect(200, {
      id: 2,
      deleted: true,
    });

    expect(forumsService.getCategory).toHaveBeenCalledWith('1');
    expect(forumsService.createCategory).toHaveBeenCalledWith({ title: 'News' });
    expect(forumsService.updateCategory).toHaveBeenCalledWith('2', {
      title: 'Updates',
    });
    expect(forumsService.deleteCategory).toHaveBeenCalledWith('2');
  });

  it('routes topic endpoints to the forum service with query and current user', async () => {
    const topic = { id: 11, title: 'First topic' };

    forumsService.listTopics.mockResolvedValue({ items: [topic], pagination: {} });
    forumsService.getTopic.mockResolvedValue(topic);
    forumsService.createTopic.mockResolvedValue(topic);
    forumsService.updateTopic.mockResolvedValue({ ...topic, title: 'Updated' });
    forumsService.deleteTopic.mockResolvedValue({ id: 11, deleted: true });

    await request(httpServer)
      .get('/forums/topics?categoryId=3&search=first&page=2&limit=5')
      .expect(200, { items: [topic], pagination: {} });
    await request(httpServer).get('/forums/topics/11').expect(200, topic);
    await request(httpServer)
      .post('/forums/topics')
      .send({ categoryId: 3, title: 'First topic', content: 'Hello' })
      .expect(201, topic);
    await request(httpServer)
      .patch('/forums/topics/11')
      .send({ title: 'Updated' })
      .expect(200, { ...topic, title: 'Updated' });
    await request(httpServer).delete('/forums/topics/11').expect(200, {
      id: 11,
      deleted: true,
    });

    expect(forumsService.listTopics).toHaveBeenCalledWith({
      categoryId: 3,
      search: 'first',
      page: 2,
      limit: 5,
    });
    expect(forumsService.createTopic).toHaveBeenCalledWith(
      { categoryId: 3, title: 'First topic', content: 'Hello' },
      { id: '7', roles: ['Admin'] },
    );
    expect(forumsService.updateTopic).toHaveBeenCalledWith(
      '11',
      { title: 'Updated' },
      { id: '7', roles: ['Admin'] },
    );
    expect(forumsService.deleteTopic).toHaveBeenCalledWith('11', {
      id: '7',
      roles: ['Admin'],
    });
  });

  it('routes post endpoints to the forum service with current user', async () => {
    const post = { id: 21, topicId: 11, content: 'Reply' };

    forumsService.listPosts.mockResolvedValue({ items: [post], pagination: {} });
    forumsService.createPost.mockResolvedValue(post);
    forumsService.updatePost.mockResolvedValue({ ...post, content: 'Updated' });
    forumsService.deletePost.mockResolvedValue({ id: 21, deleted: true });

    await request(httpServer)
      .get('/forums/topics/11/posts?page=1&limit=10')
      .expect(200, { items: [post], pagination: {} });
    await request(httpServer)
      .post('/forums/topics/11/posts')
      .send({ content: 'Reply' })
      .expect(201, post);
    await request(httpServer)
      .patch('/forums/posts/21')
      .send({ content: 'Updated' })
      .expect(200, { ...post, content: 'Updated' });
    await request(httpServer).delete('/forums/posts/21').expect(200, {
      id: 21,
      deleted: true,
    });

    expect(forumsService.listPosts).toHaveBeenCalledWith('11', {
      page: 1,
      limit: 10,
    });
    expect(forumsService.createPost).toHaveBeenCalledWith(
      '11',
      { content: 'Reply' },
      { id: '7', roles: ['Admin'] },
    );
    expect(forumsService.updatePost).toHaveBeenCalledWith(
      '21',
      { content: 'Updated' },
      { id: '7', roles: ['Admin'] },
    );
    expect(forumsService.deletePost).toHaveBeenCalledWith('21', {
      id: '7',
      roles: ['Admin'],
    });
  });

  it('validates DTO payloads at the HTTP boundary', async () => {
    await request(httpServer).post('/forums/categories').send({ title: 'x' }).expect(400);
    await request(httpServer)
      .post('/forums/topics')
      .send({ categoryId: 0, title: 'no', content: '' })
      .expect(400);
    await request(httpServer)
      .post('/forums/topics/11/posts')
      .send({ content: '' })
      .expect(400);
  });
});
