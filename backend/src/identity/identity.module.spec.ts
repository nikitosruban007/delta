import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityModule } from './identity.module';

describe('IdentityModule', () => {
  it('compiles with infrastructure and presentation providers wired', async () => {
    process.env.JWT_SECRET = 'test-secret';

    const testingModule = await Test.createTestingModule({
      imports: [IdentityModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(testingModule.get(IdentityModule)).toBeInstanceOf(IdentityModule);
  });
});
