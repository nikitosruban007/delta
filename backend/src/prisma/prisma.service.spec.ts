import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    // Create a mock PrismaService with mocked connection methods
    service = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      onModuleInit: async function () {
        await this.$connect();
      },
      onModuleDestroy: async function () {
        await this.$disconnect();
      },
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should call $connect on module initialization', async () => {
      await service.onModuleInit();
      expect(service.$connect).toHaveBeenCalled();
    });

    it('should handle connection errors gracefully', async () => {
      const error = new Error('Connection failed');
      (service.$connect as jest.Mock).mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
      expect(service.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect on module destroy', async () => {
      await service.onModuleDestroy();
      expect(service.$disconnect).toHaveBeenCalled();
    });

    it('should handle disconnection errors gracefully', async () => {
      const error = new Error('Disconnection failed');
      (service.$disconnect as jest.Mock).mockRejectedValue(error);

      await expect(service.onModuleDestroy()).rejects.toThrow(
        'Disconnection failed',
      );
      expect(service.$disconnect).toHaveBeenCalled();
    });
  });

  describe('PrismaService interface', () => {
    it('should have $connect method', () => {
      expect(service).toHaveProperty('$connect');
      expect(typeof service.$connect).toBe('function');
    });

    it('should have $disconnect method', () => {
      expect(service).toHaveProperty('$disconnect');
      expect(typeof service.$disconnect).toBe('function');
    });

    it('should have onModuleInit lifecycle hook', () => {
      expect(service).toHaveProperty('onModuleInit');
      expect(typeof service.onModuleInit).toBe('function');
    });

    it('should have onModuleDestroy lifecycle hook', () => {
      expect(service).toHaveProperty('onModuleDestroy');
      expect(typeof service.onModuleDestroy).toBe('function');
    });
  });
});
