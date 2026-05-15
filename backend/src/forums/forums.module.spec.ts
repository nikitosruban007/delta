import 'reflect-metadata';
import { ForumsController } from './forums.controller';
import { ForumsModule } from './forums.module';
import { ForumsService } from './forums.service';
import * as forumExports from './index';

describe('ForumsModule exports', () => {
  it('declares the forum controller and service provider', () => {
    expect(ForumsModule).toBeDefined();
    expect(Reflect.getMetadata('controllers', ForumsModule)).toContain(
      ForumsController,
    );
    expect(Reflect.getMetadata('providers', ForumsModule)).toContain(
      ForumsService,
    );
  });

  it('re-exports public forum backend APIs from the barrel file', () => {
    expect(forumExports.ForumsModule).toBe(ForumsModule);
    expect(forumExports.ForumsService).toBe(ForumsService);
  });
});
