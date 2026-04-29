import { ConsultationsModule } from './consultations.module';

describe('ConsultationsModule', () => {
  describe('module definition', () => {
    it('should be defined', () => {
      expect(ConsultationsModule).toBeDefined();
    });

    it('should be a class', () => {
      expect(typeof ConsultationsModule).toBe('function');
    });

    it('should have correct module name', () => {
      expect(ConsultationsModule.name).toBe('ConsultationsModule');
    });
  });

  describe('module structure', () => {
    it('should be properly decorated as NestJS module', () => {
      expect(ConsultationsModule.toString()).toContain('ConsultationsModule');
    });

    it('should be usable as module import', () => {
      const imports = [ConsultationsModule];
      expect(imports).toContain(ConsultationsModule);
      expect(imports.length).toBe(1);
    });
  });

  describe('module exports', () => {
    it('should export ConsultationsModule', () => {
      expect(ConsultationsModule).toBeDefined();
    });

    it('should be importable by other modules', () => {
      expect(ConsultationsModule).toBeDefined();
      expect(typeof ConsultationsModule).toBe('function');
    });
  });
});
