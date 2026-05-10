import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateForumCategoryDto,
  CreateForumPostDto,
  CreateForumTopicDto,
  ListForumPostsQueryDto,
  ListForumTopicsQueryDto,
  UpdateForumCategoryDto,
  UpdateForumPostDto,
  UpdateForumTopicDto,
} from './dto';

type ForumUser = {
  id: string | number;
  roles?: string[];
};

type ForumListQuery = {
  page?: string | number;
  limit?: string | number;
};

@Injectable()
export class ForumsService {
  private readonly prisma: PrismaService;

  constructor(@Inject(PrismaService) prisma: any) {
    this.prisma = prisma;
  }

  async listCategories() {
    const categories = await this.prisma.forum_categories.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { forum_topics: true },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      title: category.title,
      topicsCount: category._count.forum_topics,
    }));
  }

  async getCategory(id: string) {
    const category = await this.prisma.forum_categories.findUnique({
      where: { id: this.parseId(id, 'categoryId') },
      include: {
        _count: {
          select: { forum_topics: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Forum category not found');
    }

    return {
      id: category.id,
      title: category.title,
      topicsCount: category._count.forum_topics,
    };
  }

  async createCategory(dto: CreateForumCategoryDto) {
    return this.prisma.forum_categories.create({
      data: { title: dto.title.trim() },
    });
  }

  async updateCategory(id: string, dto: UpdateForumCategoryDto) {
    const categoryId = this.parseId(id, 'categoryId');
    await this.ensureCategoryExists(categoryId);

    return this.prisma.forum_categories.update({
      where: { id: categoryId },
      data: { title: dto.title.trim() },
    });
  }

  async deleteCategory(id: string) {
    const categoryId = this.parseId(id, 'categoryId');
    await this.ensureCategoryExists(categoryId);

    const topicsCount = await this.prisma.forum_topics.count({
      where: { category_id: categoryId },
    });

    if (topicsCount > 0) {
      throw new BadRequestException('Forum category contains topics');
    }

    await this.prisma.forum_categories.delete({
      where: { id: categoryId },
    });

    return { id: categoryId, deleted: true };
  }

  async listTopics(query: ListForumTopicsQueryDto) {
    const { page, limit } = this.resolvePagination(query);
    const where: any = {};
    const categoryId = this.parseOptionalId(query.categoryId, 'categoryId');

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (query.search?.trim()) {
      where.title = { contains: query.search.trim(), mode: 'insensitive' };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.forum_topics.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: this.topicListInclude(),
      }),
      this.prisma.forum_topics.count({ where }),
    ]);

    return {
      items: items.map((topic) => this.mapTopicListItem(topic)),
      pagination: this.mapPagination(page, limit, total),
    };
  }

  async getTopic(id: string) {
    const topic = await this.findTopicById(this.parseId(id, 'topicId'));

    if (!topic) {
      throw new NotFoundException('Forum topic not found');
    }

    return {
      id: topic.id,
      title: topic.title,
      tags: (topic as any).tags ?? [],
      createdAt: topic.created_at,
      author: this.mapAuthor(topic.users),
      category: topic.forum_categories
        ? {
            id: topic.forum_categories.id,
            title: topic.forum_categories.title,
          }
        : null,
      postsCount: topic._count.forum_posts,
    };
  }

  async createTopic(dto: CreateForumTopicDto, currentUser: ForumUser) {
    const authorId = this.parseId(currentUser.id, 'userId');
    const categoryId = this.parseId(dto.categoryId, 'categoryId');
    await this.ensureUserExists(authorId);
    await this.ensureCategoryExists(categoryId);

    const tags = dto.tags?.filter(Boolean) ?? [];

    const topic = await this.prisma.$transaction(async (tx) => {
      const createdTopic = await tx.forum_topics.create({
        data: {
          category_id: categoryId,
          author_id: authorId,
          title: dto.title.trim(),
          tags,
        },
      });

      await tx.forum_posts.create({
        data: {
          topic_id: createdTopic.id,
          author_id: authorId,
          content: dto.content.trim(),
        },
      });

      return createdTopic;
    });

    return this.getTopic(String(topic.id));
  }

  async updateTopic(id: string, dto: UpdateForumTopicDto, currentUser: ForumUser) {
    const topicId = this.parseId(id, 'topicId');
    const topic = await this.findTopicById(topicId);

    if (!topic) {
      throw new NotFoundException('Forum topic not found');
    }

    this.assertCanModify(topic.author_id, currentUser);

    const nextCategoryId = this.parseOptionalId(dto.categoryId, 'categoryId');
    const nextTitle = dto.title?.trim();

    if (nextCategoryId) {
      await this.ensureCategoryExists(nextCategoryId);
    }

    if (!nextCategoryId && !nextTitle) {
      throw new BadRequestException('No forum topic fields to update');
    }

    await this.prisma.forum_topics.update({
      where: { id: topicId },
      data: {
        category_id: nextCategoryId ?? topic.category_id,
        title: nextTitle ?? topic.title,
      },
    });

    return this.getTopic(id);
  }

  async deleteTopic(id: string, currentUser: ForumUser) {
    const topicId = this.parseId(id, 'topicId');
    const topic = await this.prisma.forum_topics.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Forum topic not found');
    }

    this.assertCanModify(topic.author_id, currentUser);

    await this.prisma.forum_topics.delete({
      where: { id: topicId },
    });

    return { id: topicId, deleted: true };
  }

  async listPosts(topicId: string, query: ListForumPostsQueryDto) {
    const parsedTopicId = this.parseId(topicId, 'topicId');
    await this.ensureTopicExists(parsedTopicId);

    const { page, limit } = this.resolvePagination(query);
    const where = { topic_id: parsedTopicId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.forum_posts.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      }),
      this.prisma.forum_posts.count({ where }),
    ]);

    return {
      items: items.map((post) => this.mapPost(post)),
      pagination: this.mapPagination(page, limit, total),
    };
  }

  async createPost(topicId: string, dto: CreateForumPostDto, currentUser: ForumUser) {
    const parsedTopicId = this.parseId(topicId, 'topicId');
    const authorId = this.parseId(currentUser.id, 'userId');

    await this.ensureTopicExists(parsedTopicId);
    await this.ensureUserExists(authorId);

    const post = await this.prisma.forum_posts.create({
      data: {
        topic_id: parsedTopicId,
        author_id: authorId,
        content: dto.content.trim(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    return this.mapPost(post);
  }

  async updatePost(id: string, dto: UpdateForumPostDto, currentUser: ForumUser) {
    const postId = this.parseId(id, 'postId');
    const post = await this.prisma.forum_posts.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Forum post not found');
    }

    this.assertCanModify(post.author_id, currentUser);

    const updated = await this.prisma.forum_posts.update({
      where: { id: postId },
      data: { content: dto.content.trim() },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    return this.mapPost(updated);
  }

  async deletePost(id: string, currentUser: ForumUser) {
    const postId = this.parseId(id, 'postId');
    const post = await this.prisma.forum_posts.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Forum post not found');
    }

    this.assertCanModify(post.author_id, currentUser);

    await this.prisma.forum_posts.delete({
      where: { id: postId },
    });

    return { id: postId, deleted: true };
  }

  private async findTopicById(id: number) {
    return this.prisma.forum_topics.findUnique({
      where: { id },
      include: this.topicListInclude(),
    });
  }

  private topicListInclude() {
    return {
      forum_categories: {
        select: {
          id: true,
          title: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
        },
      },
      _count: {
        select: { forum_posts: true },
      },
    };
  }

  private mapTopicListItem(topic: any) {
    return {
      id: topic.id,
      title: topic.title,
      tags: topic.tags ?? [],
      createdAt: topic.created_at,
      author: this.mapAuthor(topic.users),
      category: topic.forum_categories
        ? {
            id: topic.forum_categories.id,
            title: topic.forum_categories.title,
          }
        : null,
      postsCount: topic._count.forum_posts,
    };
  }

  private mapPost(post: any) {
    return {
      id: post.id,
      topicId: post.topic_id,
      content: post.content,
      createdAt: post.created_at,
      author: this.mapAuthor(post.users),
    };
  }

  private mapAuthor(user: any) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatar_url,
    };
  }

  private mapPagination(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  private async ensureUserExists(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Forum author not found');
    }
  }

  private async ensureCategoryExists(id: number) {
    const category = await this.prisma.forum_categories.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Forum category not found');
    }
  }

  private async ensureTopicExists(id: number) {
    const topic = await this.prisma.forum_topics.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!topic) {
      throw new NotFoundException('Forum topic not found');
    }
  }

  private assertCanModify(authorId: number | null, currentUser: ForumUser) {
    const currentUserId = this.parseId(currentUser.id, 'userId');

    if (authorId === currentUserId || currentUser.roles?.includes('ADMIN')) {
      return;
    }

    throw new ForbiddenException('You cannot modify this forum resource');
  }

  private resolvePagination(query: ForumListQuery) {
    const limit = this.parseOptionalId(query.limit, 'limit') ?? 20;

    if (limit > 100) {
      throw new BadRequestException('Invalid limit');
    }

    return {
      page: this.parseOptionalId(query.page, 'page') ?? 1,
      limit,
    };
  }

  private parseOptionalId(
    value: string | number | undefined,
    fieldName: string,
  ): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return this.parseId(value, fieldName);
  }

  private parseId(value: string | number, fieldName: string): number {
    const parsed = typeof value === 'number' ? value : Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }

    return parsed;
  }
}
