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

  async updateTopic(
    id: string,
    dto: UpdateForumTopicDto,
    currentUser: ForumUser,
  ) {
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

  async listPosts(
    topicId: string,
    query: ListForumPostsQueryDto,
    currentUser?: ForumUser,
  ) {
    const parsedTopicId = this.parseId(topicId, 'topicId');
    await this.ensureTopicExists(parsedTopicId);

    const { page, limit } = this.resolvePagination(query);
    const where = { topic_id: parsedTopicId };
    const myId = currentUser ? Number(currentUser.id) : null;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.forum_posts.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          users: { select: { id: true, name: true, avatar_url: true } },
          forum_post_votes: { select: { value: true, user_id: true } },
          _count: { select: { children: true } },
        },
      }),
      this.prisma.forum_posts.count({ where }),
    ]);

    return {
      items: items.map((post: any) => {
        const myVote = myId
          ? (post.forum_post_votes.find((v: any) => v.user_id === myId)
              ?.value ?? null)
          : null;
        return this.mapPost({
          ...post,
          _myVote: myVote,
          _childrenCount: post._count?.children ?? 0,
        });
      }),
      pagination: this.mapPagination(page, limit, total),
    };
  }

  async createPost(
    topicId: string,
    dto: CreateForumPostDto,
    currentUser: ForumUser,
  ) {
    const parsedTopicId = this.parseId(topicId, 'topicId');
    const authorId = this.parseId(currentUser.id, 'userId');

    await this.ensureTopicExists(parsedTopicId);
    await this.ensureUserExists(authorId);

    let parentId: number | null = null;
    if ((dto as any).parentId !== undefined && (dto as any).parentId !== null) {
      parentId = this.parseId((dto as any).parentId, 'parentId');
      const parent = await this.prisma.forum_posts.findUnique({
        where: { id: parentId },
      });
      if (!parent || parent.topic_id !== parsedTopicId) {
        throw new BadRequestException(
          'Parent post does not belong to this topic',
        );
      }
    }

    const post = await this.prisma.forum_posts.create({
      data: {
        topic_id: parsedTopicId,
        author_id: authorId,
        parent_id: parentId,
        content: dto.content.trim(),
      },
      include: {
        users: { select: { id: true, name: true, avatar_url: true } },
        forum_post_votes: { select: { value: true, user_id: true } },
        _count: { select: { children: true } },
      },
    });

    return this.mapPost({
      ...post,
      _myVote: null,
      _childrenCount: post._count?.children ?? 0,
    });
  }

  async votePost(postId: string, value: 1 | -1 | 0, currentUser: ForumUser) {
    const pid = this.parseId(postId, 'postId');
    const uid = this.parseId(currentUser.id, 'userId');

    const post = await this.prisma.forum_posts.findUnique({
      where: { id: pid },
    });
    if (!post) throw new NotFoundException('Forum post not found');
    if (post.is_deleted)
      throw new BadRequestException('Cannot vote on a deleted post');
    if (post.author_id === uid) {
      throw new BadRequestException('You cannot vote on your own post');
    }

    if (value === 0) {
      await this.prisma.forum_post_votes
        .delete({ where: { post_id_user_id: { post_id: pid, user_id: uid } } })
        .catch(() => undefined);
    } else {
      await this.prisma.forum_post_votes.upsert({
        where: { post_id_user_id: { post_id: pid, user_id: uid } },
        create: { post_id: pid, user_id: uid, value },
        update: { value },
      });
    }

    const votes = await this.prisma.forum_post_votes.findMany({
      where: { post_id: pid },
      select: { value: true, user_id: true },
    });
    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;
    const myVote = votes.find((v) => v.user_id === uid)?.value ?? null;
    return {
      postId: pid,
      upvotes,
      downvotes,
      score: upvotes - downvotes,
      myVote,
    };
  }

  async reportPost(postId: string, reason: string, currentUser: ForumUser) {
    const pid = this.parseId(postId, 'postId');
    const uid = this.parseId(currentUser.id, 'userId');
    const post = await this.prisma.forum_posts.findUnique({
      where: { id: pid },
    });
    if (!post) throw new NotFoundException('Forum post not found');
    if (post.author_id === uid) {
      throw new BadRequestException('You cannot report your own post');
    }
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      throw new BadRequestException('Reason is required (min 3 characters)');
    }
    const existing = await this.prisma.forum_reports.findFirst({
      where: { post_id: pid, reporter_id: uid, status: 'open' },
    });
    if (existing) return { id: existing.id, status: existing.status };
    const row = await this.prisma.forum_reports.create({
      data: { post_id: pid, reporter_id: uid, reason: trimmed, status: 'open' },
    });
    return { id: row.id, status: row.status };
  }

  async reportTopic(topicId: string, reason: string, currentUser: ForumUser) {
    const tid = this.parseId(topicId, 'topicId');
    const uid = this.parseId(currentUser.id, 'userId');
    await this.ensureTopicExists(tid);
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      throw new BadRequestException('Reason is required (min 3 characters)');
    }
    const existing = await this.prisma.forum_reports.findFirst({
      where: { topic_id: tid, reporter_id: uid, status: 'open' },
    });
    if (existing) return { id: existing.id, status: existing.status };
    const row = await this.prisma.forum_reports.create({
      data: {
        topic_id: tid,
        reporter_id: uid,
        reason: trimmed,
        status: 'open',
      },
    });
    return { id: row.id, status: row.status };
  }

  async listReports(
    currentUser: ForumUser,
    status: 'open' | 'resolved' | 'all' = 'open',
  ) {
    if (!currentUser.roles?.includes('ADMIN')) {
      throw new ForbiddenException('Only admins can view reports');
    }
    const where = status === 'all' ? {} : { status };
    const rows = await this.prisma.forum_reports.findMany({
      where,
      orderBy: { id: 'desc' },
      take: 200,
      include: {
        users: { select: { id: true, name: true, email: true } },
        forum_posts: {
          select: { id: true, content: true, topic_id: true, is_deleted: true },
        },
        forum_topics: { select: { id: true, title: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      reason: r.reason,
      createdAt: r.created_at,
      resolvedAt: r.resolved_at,
      reporter: r.users
        ? { id: r.users.id, name: r.users.name, email: r.users.email }
        : null,
      post: r.forum_posts
        ? {
            id: r.forum_posts.id,
            topicId: r.forum_posts.topic_id,
            content: r.forum_posts.is_deleted ? null : r.forum_posts.content,
          }
        : null,
      topic: r.forum_topics
        ? { id: r.forum_topics.id, title: r.forum_topics.title }
        : null,
    }));
  }

  async resolveReport(reportId: string, currentUser: ForumUser) {
    if (!currentUser.roles?.includes('ADMIN')) {
      throw new ForbiddenException('Only admins can resolve reports');
    }
    const rid = this.parseId(reportId, 'reportId');
    const row = await this.prisma.forum_reports.findUnique({
      where: { id: rid },
    });
    if (!row) throw new NotFoundException('Report not found');
    const updated = await this.prisma.forum_reports.update({
      where: { id: rid },
      data: { status: 'resolved', resolved_at: new Date() },
    });
    return { id: updated.id, status: updated.status };
  }

  async updatePost(
    id: string,
    dto: UpdateForumPostDto,
    currentUser: ForumUser,
  ) {
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
      include: { _count: { select: { children: true } } },
    });

    if (!post) {
      throw new NotFoundException('Forum post not found');
    }

    this.assertCanModify(post.author_id, currentUser);

    if ((post._count?.children ?? 0) > 0) {
      // Soft-delete so child replies remain readable in context.
      await this.prisma.forum_posts.update({
        where: { id: postId },
        data: {
          is_deleted: true,
          content: '[deleted]',
          updated_at: new Date(),
        },
      });
      return { id: postId, deleted: true, softDelete: true };
    }

    await this.prisma.forum_posts.delete({ where: { id: postId } });
    return { id: postId, deleted: true, softDelete: false };
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
    const upvotes = Array.isArray(post.forum_post_votes)
      ? post.forum_post_votes.filter((v: any) => v.value === 1).length
      : (post._upvotes ?? 0);
    const downvotes = Array.isArray(post.forum_post_votes)
      ? post.forum_post_votes.filter((v: any) => v.value === -1).length
      : (post._downvotes ?? 0);
    return {
      id: post.id,
      topicId: post.topic_id,
      parentId: post.parent_id ?? null,
      content: post.is_deleted ? null : post.content,
      isDeleted: Boolean(post.is_deleted),
      createdAt: post.created_at,
      updatedAt: post.updated_at ?? post.created_at,
      author: this.mapAuthor(post.users),
      score: upvotes - downvotes,
      upvotes,
      downvotes,
      myVote: typeof post._myVote === 'number' ? post._myVote : null,
      childrenCount: post._childrenCount ?? 0,
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
