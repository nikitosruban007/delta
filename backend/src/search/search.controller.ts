import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Platform-wide search across tournaments, forum topics, users',
  })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['tournaments', 'topics', 'users', 'all'],
  })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query('q') q: string,
    @Query('type') type: 'tournaments' | 'topics' | 'users' | 'all' = 'all',
    @Query('limit') limitParam?: string,
  ) {
    const term = (q ?? '').trim();
    if (term.length < 2) {
      return { tournaments: [], topics: [], users: [] };
    }
    const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 25);
    const wantTournaments = type === 'tournaments' || type === 'all';
    const wantTopics = type === 'topics' || type === 'all';
    const wantUsers = type === 'users' || type === 'all';

    const [tournaments, topics, users] = await Promise.all([
      wantTournaments
        ? this.prisma.tournaments.findMany({
            where: {
              OR: [
                { title: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
              ],
            },
            take: limit,
            orderBy: { created_at: 'desc' },
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              created_at: true,
            },
          })
        : Promise.resolve([]),
      wantTopics
        ? this.prisma.forum_topics.findMany({
            where: {
              OR: [
                { title: { contains: term, mode: 'insensitive' } },
                { tags: { has: term } },
              ],
            },
            take: limit,
            orderBy: { id: 'desc' },
            include: {
              forum_categories: { select: { id: true, title: true } },
              users: { select: { id: true, name: true } },
            },
          })
        : Promise.resolve([]),
      wantUsers
        ? this.prisma.users.findMany({
            where: {
              status: 'active',
              OR: [
                { email: { contains: term, mode: 'insensitive' } },
                { username: { contains: term, mode: 'insensitive' } },
                { name: { contains: term, mode: 'insensitive' } },
              ],
            },
            take: limit,
            orderBy: { name: 'asc' },
            select: {
              id: true,
              email: true,
              username: true,
              name: true,
              avatar_url: true,
            },
          })
        : Promise.resolve([]),
    ]);

    return {
      tournaments: tournaments.map((t) => ({
        id: String(t.id),
        title: t.title,
        description: t.description,
        status: t.status,
        createdAt: t.created_at,
      })),
      topics: topics.map((t) => ({
        id: String(t.id),
        title: t.title ?? '',
        tags: t.tags ?? [],
        category: t.forum_categories
          ? { id: t.forum_categories.id, title: t.forum_categories.title }
          : null,
        author: t.users ? { id: t.users.id, name: t.users.name } : null,
      })),
      users: users.map((u) => ({
        id: String(u.id),
        email: u.email,
        username: u.username,
        name: u.name,
        avatarUrl: u.avatar_url,
      })),
    };
  }
}
