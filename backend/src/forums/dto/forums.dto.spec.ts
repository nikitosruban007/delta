import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateForumCategoryDto,
  CreateForumPostDto,
  CreateForumTopicDto,
  ListForumPostsQueryDto,
  ListForumTopicsQueryDto,
  UpdateForumCategoryDto,
  UpdateForumPostDto,
  UpdateForumTopicDto,
} from './index';

describe('Forum DTO validation', () => {
  const expectValid = async (dto: object) => {
    await expect(validate(dto)).resolves.toHaveLength(0);
  };

  const expectInvalid = async (dto: object) => {
    await expect(validate(dto)).resolves.not.toHaveLength(0);
  };

  it('validates category payloads', async () => {
    await expectValid(
      plainToInstance(CreateForumCategoryDto, { title: 'General' }),
    );
    await expectInvalid(
      plainToInstance(CreateForumCategoryDto, { title: 'x' }),
    );
    await expectValid(
      plainToInstance(UpdateForumCategoryDto, { title: 'News' }),
    );
    await expectInvalid(plainToInstance(UpdateForumCategoryDto, { title: '' }));
  });

  it('validates topic payloads and transforms category ids', async () => {
    const createDto = plainToInstance(CreateForumTopicDto, {
      categoryId: '3',
      title: 'First topic',
      content: 'Hello',
    });
    const updateDto = plainToInstance(UpdateForumTopicDto, {
      categoryId: '4',
      title: 'Updated topic',
    });

    expect(createDto.categoryId).toBe(3);
    expect(updateDto.categoryId).toBe(4);
    await expectValid(createDto);
    await expectValid(updateDto);
    await expectInvalid(
      plainToInstance(CreateForumTopicDto, {
        categoryId: 0,
        title: 'No',
        content: '',
      }),
    );
    await expectInvalid(
      plainToInstance(UpdateForumTopicDto, { categoryId: 0 }),
    );
  });

  it('validates post payloads', async () => {
    await expectValid(
      plainToInstance(CreateForumPostDto, { content: 'Reply' }),
    );
    await expectInvalid(plainToInstance(CreateForumPostDto, { content: '' }));
    await expectValid(
      plainToInstance(UpdateForumPostDto, { content: 'Updated' }),
    );
    await expectInvalid(plainToInstance(UpdateForumPostDto, { content: '' }));
  });

  it('validates list query payloads and transforms numeric query params', async () => {
    const topicQuery = plainToInstance(ListForumTopicsQueryDto, {
      categoryId: '3',
      search: 'first',
      page: '2',
      limit: '10',
    });
    const postQuery = plainToInstance(ListForumPostsQueryDto, {
      page: '1',
      limit: '5',
    });

    expect(topicQuery.categoryId).toBe(3);
    expect(topicQuery.page).toBe(2);
    expect(topicQuery.limit).toBe(10);
    expect(postQuery.page).toBe(1);
    expect(postQuery.limit).toBe(5);
    await expectValid(topicQuery);
    await expectValid(postQuery);
    await expectInvalid(
      plainToInstance(ListForumTopicsQueryDto, { limit: 101 }),
    );
    await expectInvalid(plainToInstance(ListForumPostsQueryDto, { page: 0 }));
  });
});
