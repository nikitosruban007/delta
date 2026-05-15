import { ConsultationsLogger } from './logger';

describe('ConsultationsLogger', () => {
  let logger: ConsultationsLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new ConsultationsLogger();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('info', () => {
    it('should log info message with metadata', () => {
      logger.info('Test message', { userId: 'user-1' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[consultations] INFO',
        'Test message',
        { userId: 'user-1' },
      );
    });

    it('should log info message without metadata', () => {
      logger.info('Test message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[consultations] INFO',
        'Test message',
        '',
      );
    });
  });

  describe('warn', () => {
    it('should log warning message with metadata', () => {
      logger.warn('Warning message', { consultationId: 'c1' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[consultations] WARN',
        'Warning message',
        { consultationId: 'c1' },
      );
    });

    it('should log warning message without metadata', () => {
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[consultations] WARN',
        'Warning message',
        '',
      );
    });
  });

  describe('error', () => {
    it('should log error message with metadata', () => {
      logger.error('Error message', { error: 'test error' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[consultations] ERROR',
        'Error message',
        { error: 'test error' },
      );
    });

    it('should log error message without metadata', () => {
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[consultations] ERROR',
        'Error message',
        '',
      );
    });
  });

  describe('logger consistency', () => {
    it('should use appropriate console methods', () => {
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
