import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ForumsService } from './forums.service';

const author = { id: 7, name: 'Ada', avatar_url: null };
const category = { id: 3, title: 'General' };

const topicItem = {
  id: 11,
  category_id: category.id,
  author_id: author.id,
  title: 'First topic',
  users: author,
  forum_categories: category,
  _count: { forum_posts: 2 },
};

const postItem = {
  id: 21,
  topic_id: topicItem.id,
  author_id: author.id,
  content: 'Hello',
  users: author,
};

describe('ForumsService', () => {
  const createPrisma = () => {
    const prisma = {
      $transaction: jest.fn((value) => Promise.resolve(value)),
      users: {
        findUnique: jest.fn(),
      },
      forum_categories: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      forum_topics: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      forum_posts: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    return prisma as unknown as jest.Mocked<PrismaService>;
  };

  const serviceWith = () => {
    const prisma = createPrisma();
    return { prisma, service: new ForumsService(prisma) };
  };

  it('lists, reads, creates, updates and deletes categories', async () => {
    const { prisma, service } = serviceWith();
    const categoryWithCount = { ...category, _count: { forum_topics: 0 } };

    prisma.forum_categories.findMany.mockResolvedValue([categoryWithCount] as never);
    prisma.forum_categories.findUnique.mockResolvedValue(categoryWithCount as never);
    prisma.forum_categories.create.mockResolvedValue(category as never);
    prisma.forum_categories.update.mockResolvedValue({ ...category, title: 'News' } as never);
    prisma.forum_topics.count.mockResolvedValue(0 as never);
    prisma.forum_categories.delete.mockResolvedValue(category as never);

    await expect(service.listCategories()).resolves.toEqual([
      { id: 3, title: 'General', topicsCount: 0 },
    ]);
    await expect(service.getCategory('3')).resolves.toEqual({
      id: 3,
      title: 'General',
      topicsCount: 0,
    });
    await expect(service.createCategory({ title: '  General  ' })).resolves.toEqual(
      category,
    );
    await expect(service.updateCategory('3', { title: '  News  ' })).resolves.toEqual({
      id: 3,
      title: 'News',
    });
    await expect(service.deleteCategory('3')).resolves.toEqual({
      id: 3,
      deleted: true,
    });

    expect(prisma.forum_categories.create).toHaveBeenCalledWith({
      data: { title: 'General' },
    });
    expect(prisma.forum_categories.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { title: 'News' },
    });
  });

  it('throws category errors for missing, invalid and non-empty categories', async () => {
    const { prisma, service } = serviceWith();

    await expect(service.getCategory('abc')).rejects.toBeInstanceOf(BadRequestException);

    prisma.forum_categories.findUnique.mockResolvedValue(null as never);
    await expect(service.getCategory('3')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.updateCategory('3', { title: 'News' })).rejects.toBeInstanceOf(
      NotFoundException,
    );

    prisma.forum_categories.findUnique.mockResolvedValue({ id: 3 } as never);
    prisma.forum_topics.count.mockResolvedValue(1 as never);
    await expect(service.deleteCategory('3')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists topics with filters, search and pagination', async () => {
    const { prisma, service } = serviceWith();

    prisma.$transaction.mockResolvedValue([[topicItem], 1] as never);

    await expect(
      service.listTopics({
        categoryId: '3' as unknown as number,
        search: ' first ',
        page: '2' as unknown as number,
        limit: '5' as unknown as number,
      }),
    ).resolves.toEqual({
      items: [
        {
          id: 11,
          title: 'First topic',
          author: { id: 7, name: 'Ada', avatarUrl: null },
          category: { id: 3, title: 'General' },
          postsCount: 2,
        },
      ],
      pagination: { page: 2, limit: 5, total: 1, pages: 1 },
    });

    expect(prisma.forum_topics.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          category_id: 3,
          title: { contains: 'first', mode: 'insensitive' },
        },
        skip: 5,
        take: 5,
      }),
    );
  });

  it('lists topics with default filters and nullable category mapping', async () => {
    const { prisma, service } = serviceWith();
    const topicWithoutCategory = {
      ...topicItem,
      forum_categories: null,
      users: null,
    };

    prisma.$transaction.mockResolvedValue([[topicWithoutCategory], 0] as never);

    await expect(service.listTopics({})).resolves.toEqual({
      items: [
        {
          id: 11,
          title: 'First topic',
          author: null,
          category: null,
          postsCount: 2,
        },
      ],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    });

    expect(prisma.forum_topics.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 20,
      }),
    );
  });

  it('reads topics with nullable author and category mappings', async () => {
    const { prisma, service } = serviceWith();

    prisma.forum_topics.findUnique.mockResolvedValue({
      ...topicItem,
      users: null,
      forum_categories: null,
      _count: { forum_posts: 0 },
    } as never);

    await expect(service.getTopic('11')).resolves.toEqual({
      id: 11,
      title: 'First topic',
      author: null,
      category: null,
      postsCount: 0,
    });
  });

  it('creates a topic and first post in one transaction', async () => {
    const { prisma, service } = serviceWith();
    const tx = {
      forum_topics: { create: jest.fn().mockResolvedValue({ id: 11 }) },
      forum_posts: { create: jest.fn() },
    };

    prisma.users.findUnique.mockResolvedValue({ id: author.id } as never);
    prisma.forum_categories.findUnique.mockResolvedValue({ id: category.id } as never);
    prisma.$transaction.mockImplementation(async (callback: any) => callback(tx));
    prisma.forum_topics.findUnique.mockResolvedValue(topicItem as never);

    await expect(
      service.createTopic(
        { categoryId: '3' as unknown as number, title: '  First topic  ', content: '  Hello  ' },
        { id: '7', roles: [] },
      ),
    ).resolves.toMatchObject({ id: 11, postsCount: 2 });

    expect(tx.forum_topics.create).toHaveBeenCalledWith({
      data: { category_id: 3, author_id: 7, title: 'First topic' },
    });
    expect(tx.forum_posts.create).toHaveBeenCalledWith({
      data: { topic_id: 11, author_id: 7, content: 'Hello' },
    });
  });

  it('updates and deletes topics for authors and admins', async () => {
    const { prisma, service } = serviceWith();

    prisma.forum_topics.findUnique
      .mockResolvedValueOnce(topicItem as never)
      .mockResolvedValueOnce({ ...topicItem, title: 'Updated' } as never)
      .mockResolvedValueOnce({ ...topicItem, author_id: 9 } as never);
    prisma.forum_categories.findUnique.mockResolvedValue({ id: 3 } as never);
    prisma.forum_topics.update.mockResolvedValue({ ...topicItem, title: 'Updated' } as never);
    prisma.forum_topics.delete.mockResolvedValue(topicItem as never);

    await expect(
      service.updateTopic(
        '11',
        { categoryId: '3' as unknown as number, title: ' Updated ' },
        { id: 7, roles: [] },
      ),
    ).resolves.toMatchObject({ id: 11, title: 'Updated' });

    await expect(service.deleteTopic('11', { id: 7, roles: ['Admin'] })).resolves.toEqual({
      id: 11,
      deleted: true,
    });
  });

  it('updates only a topic category and keeps the current title', async () => {
    const { prisma, service } = serviceWith();

    prisma.forum_topics.findUnique
      .mockResolvedValueOnce(topicItem as never)
      .mockResolvedValueOnce(topicItem as never);
    prisma.forum_categories.findUnique.mockResolvedValue({ id: 4 } as never);
    prisma.forum_topics.update.mockResolvedValue(topicItem as never);

    await expect(
      service.updateTopic(
        '11',
        { categoryId: '4' as unknown as number },
        { id: 7, roles: [] },
      ),
    ).resolves.toMatchObject({ id: 11, title: 'First topic' });

    expect(prisma.forum_topics.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: { category_id: 4, title: 'First topic' },
    });
  });

  it('updates only a topic title and keeps the current category', async () => {
    const { prisma, service } = serviceWith();

    prisma.forum_topics.findUnique
      .mockResolvedValueOnce(topicItem as never)
      .mockResolvedValueOnce({ ...topicItem, title: 'Renamed' } as never);
    prisma.forum_topics.update.mockResolvedValue({ ...topicItem, title: 'Renamed' } as never);

    await expect(
      service.updateTopic('11', { title: ' Renamed ' }, { id: 7, roles: [] }),
    ).resolves.toMatchObject({ id: 11, title: 'Renamed' });

    expect(prisma.forum_topics.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: { category_id: 3, title: 'Renamed' },
    });
  });

  it('throws topic validation, not-found and authorization errors', async () => {
    const { prisma, service } = serviceWith();

    await expect(service.listTopics({ limit: '101' as unknown as number })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.listTopics({ page: '0' as unknown as number })).rejects.toBeInstanceOf(
      BadRequestException,
    );

    prisma.forum_topics.findUnique.mockResolvedValue(null as never);
    await expect(service.getTopic('11')).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.updateTopic('11', { title: 'Updated' }, { id: 7, roles: [] }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.deleteTopic('11', { id: 7, roles: [] })).rejects.toBeInstanceOf(
      NotFoundException,
    );

    prisma.forum_topics.findUnique.mockResolvedValue(topicItem as never);
    await expect(
      service.updateTopic('11', {}, { id: 7, roles: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.updateTopic('11', { title: 'Updated' }, { id: 9, roles: [] }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lists, creates, updates and deletes posts', async () => {
    const { prisma, service } = serviceWith();

    prisma.forum_topics.findUnique.mockResolvedValue({ id: 11 } as never);
    prisma.users.findUnique.mockResolvedValue({ id: 7 } as never);
    prisma.$transaction.mockResolvedValue([[postItem], 1] as never);
    prisma.forum_posts.create.mockResolvedValue({ ...postItem, content: 'Reply' } as never);
    prisma.forum_posts.findUnique.mockResolvedValue(postItem as never);
    prisma.forum_posts.update.mockResolvedValue({ ...postItem, content: 'Updated' } as never);
    prisma.forum_posts.delete.mockResolvedValue(postItem as never);

    await expect(service.listPosts('11', { page: 1, limit: 10 })).resolves.toEqual({
      items: [{ id: 21, topicId: 11, content: 'Hello', author: { id: 7, name: 'Ada', avatarUrl: null } }],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });
    await expect(
      service.createPost('11', { content: ' Reply ' }, { id: 7, roles: [] }),
    ).resolves.toEqual({
      id: 21,
      topicId: 11,
      content: 'Reply',
      author: { id: 7, name: 'Ada', avatarUrl: null },
    });
    await expect(
      service.updatePost('21', { content: ' Updated ' }, { id: 7, roles: [] }),
    ).resolves.toEqual({
      id: 21,
      topicId: 11,
      content: 'Updated',
      author: { id: 7, name: 'Ada', avatarUrl: null },
    });
    await expect(service.deletePost('21', { id: 99, roles: ['Admin'] })).resolves.toEqual({
      id: 21,
      deleted: true,
    });
  });

  it('throws post and dependency errors', async () => {
    const { prisma, service } = serviceWith();

    prisma.forum_topics.findUnique.mockResolvedValue(null as never);
    await expect(service.listPosts('11', {})).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.createPost('11', { content: 'Reply' }, { id: 7, roles: [] }),
    ).rejects.toBeInstanceOf(NotFoundException);

    prisma.forum_topics.findUnique.mockResolvedValue({ id: 11 } as never);
    prisma.users.findUnique.mockResolvedValue(null as never);
    await expect(
      service.createPost('11', { content: 'Reply' }, { id: 7, roles: [] }),
    ).rejects.toBeInstanceOf(NotFoundException);

    prisma.forum_posts.findUnique.mockResolvedValue(null as never);
    await expect(
      service.updatePost('21', { content: 'Nope' }, { id: 7, roles: [] }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.deletePost('21', { id: 7, roles: [] })).rejects.toBeInstanceOf(
      NotFoundException,
    );

    prisma.forum_posts.findUnique.mockResolvedValue({ id: 21, author_id: 9 } as never);
    await expect(
      service.updatePost('21', { content: 'Nope' }, { id: 7, roles: [] }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws user and category dependency errors while creating topics', async () => {
    const { prisma, service } = serviceWith();

    prisma.users.findUnique.mockResolvedValue(null as never);
    await expect(
      service.createTopic(
        { categoryId: 3, title: 'Topic', content: 'Body' },
        { id: 7, roles: [] },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    prisma.users.findUnique.mockResolvedValue({ id: 7 } as never);
    prisma.forum_categories.findUnique.mockResolvedValue(null as never);
    await expect(
      service.createTopic(
        { categoryId: 3, title: 'Topic', content: 'Body' },
        { id: 7, roles: [] },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
