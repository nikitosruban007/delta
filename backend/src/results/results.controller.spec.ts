import { ResultsController } from './results.controller';

describe('ResultsController', () => {
  it('delegates result creation to the service', () => {
    const service = {
      createResult: jest.fn().mockReturnValue({ id: 1 }),
      listResults: jest.fn(),
    };
    const controller = new ResultsController(service as any);
    const dto = { userId: 7, score: 42 };

    expect(controller.createResult('5', dto)).toEqual({ id: 1 });
    expect(service.createResult).toHaveBeenCalledWith('5', dto);
  });

  it('delegates result listing to the service', () => {
    const service = {
      createResult: jest.fn(),
      listResults: jest.fn().mockReturnValue({ items: [] }),
    };
    const controller = new ResultsController(service as any);
    const query = { page: 1, limit: 20 };

    expect(controller.listResults('5', query)).toEqual({ items: [] });
    expect(service.listResults).toHaveBeenCalledWith('5', query);
  });
});
