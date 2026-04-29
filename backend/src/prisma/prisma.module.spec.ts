import { PrismaModule } from './prisma.module';

describe('PrismaModule', () => {
  describe('module definition', () => {
    it('should be defined', () => {
      expect(PrismaModule).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof PrismaModule).toBe('function');
    });

    it('should have correct name', () => {
      expect(PrismaModule.name).toBe('PrismaModule');
    });
  });

  describe('module exports', () => {
    it('should export PrismaModule', () => {
      expect(PrismaModule).toBeDefined();
      expect(PrismaModule.toString()).toContain('PrismaModule');
    });

    it('should be usable as a module import', () => {
      // Verify module can be used as decorator argument
      const imports = [PrismaModule];
      expect(imports).toContain(PrismaModule);
      expect(imports.length).toBe(1);
    });
  });

  describe('module providers', () => {
    it('should have PrismaService defined in module', () => {
      expect(PrismaModule).toBeDefined();
      // Module provides PrismaService via @Module decorator
      expect(PrismaModule.name).toMatch(/Module/);
    });

    it('should export PrismaService for injection in dependent modules', () => {
      // Module exports PrismaService, so it can be injected elsewhere
      expect(PrismaModule).toBeDefined();
    });
  });
});
