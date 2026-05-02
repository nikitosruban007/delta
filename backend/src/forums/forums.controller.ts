/* istanbul ignore file -- HTTP behavior is covered by Supertest; Nest decorators add non-actionable branch noise. */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../identity/presentation/decorators/current-user.decorator';
import { Roles } from '../identity/presentation/decorators/roles.decorator';
import { JwtAuthGuard } from '../identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../identity/presentation/guards/roles.guard';
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
import { ForumsService } from './forums.service';

type ForumUser = {
  id: string;
  roles?: string[];
};

@ApiTags('forums')
@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  // TODO(frontend): connect forum category list screen to GET /forums/categories.
  @Get('categories')
  @ApiOperation({ summary: 'List forum categories' })
  listCategories() {
    return this.forumsService.listCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get forum category' })
  getCategory(@Param('id') id: string) {
    return this.forumsService.getCategory(id);
  }

  // TODO(frontend): expose admin category creation UI when role-based screens are ready.
  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create forum category' })
  createCategory(@Body() dto: CreateForumCategoryDto) {
    return this.forumsService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update forum category' })
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateForumCategoryDto,
  ) {
    return this.forumsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete empty forum category' })
  deleteCategory(@Param('id') id: string) {
    return this.forumsService.deleteCategory(id);
  }

  // TODO(frontend): connect forum topic list and search UI to GET /forums/topics.
  @Get('topics')
  @ApiOperation({ summary: 'List forum topics' })
  listTopics(@Query() query: ListForumTopicsQueryDto) {
    return this.forumsService.listTopics(query);
  }

  @Get('topics/:id')
  @ApiOperation({ summary: 'Get forum topic' })
  getTopic(@Param('id') id: string) {
    return this.forumsService.getTopic(id);
  }

  // TODO(frontend): wire authenticated create-topic form to POST /forums/topics.
  @Post('topics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create forum topic with first post' })
  createTopic(
    @Body() dto: CreateForumTopicDto,
    @CurrentUser() user: ForumUser,
  ) {
    return this.forumsService.createTopic(dto, user);
  }

  @Patch('topics/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own forum topic or any topic as admin' })
  updateTopic(
    @Param('id') id: string,
    @Body() dto: UpdateForumTopicDto,
    @CurrentUser() user: ForumUser,
  ) {
    return this.forumsService.updateTopic(id, dto, user);
  }

  @Delete('topics/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own forum topic or any topic as admin' })
  deleteTopic(@Param('id') id: string, @CurrentUser() user: ForumUser) {
    return this.forumsService.deleteTopic(id, user);
  }

  // TODO(frontend): connect topic detail thread view to GET /forums/topics/:topicId/posts.
  @Get('topics/:topicId/posts')
  @ApiOperation({ summary: 'List forum topic posts' })
  listPosts(
    @Param('topicId') topicId: string,
    @Query() query: ListForumPostsQueryDto,
  ) {
    return this.forumsService.listPosts(topicId, query);
  }

  // TODO(frontend): wire reply editor to POST /forums/topics/:topicId/posts.
  @Post('topics/:topicId/posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create forum post in topic' })
  createPost(
    @Param('topicId') topicId: string,
    @Body() dto: CreateForumPostDto,
    @CurrentUser() user: ForumUser,
  ) {
    return this.forumsService.createPost(topicId, dto, user);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own forum post or any post as admin' })
  updatePost(
    @Param('id') id: string,
    @Body() dto: UpdateForumPostDto,
    @CurrentUser() user: ForumUser,
  ) {
    return this.forumsService.updatePost(id, dto, user);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own forum post or any post as admin' })
  deletePost(@Param('id') id: string, @CurrentUser() user: ForumUser) {
    return this.forumsService.deletePost(id, user);
  }
}
