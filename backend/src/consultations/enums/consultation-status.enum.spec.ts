import { ConsultationStatus } from './consultation-status.enum';

describe('ConsultationStatus Enum', () => {
  it('should have SCHEDULED status', () => {
    expect(ConsultationStatus.SCHEDULED).toBeDefined();
    expect(ConsultationStatus.SCHEDULED).toBe('SCHEDULED');
  });

  it('should have ACTIVE status', () => {
    expect(ConsultationStatus.ACTIVE).toBeDefined();
    expect(ConsultationStatus.ACTIVE).toBe('ACTIVE');
  });

  it('should have ENDED status', () => {
    expect(ConsultationStatus.ENDED).toBeDefined();
    expect(ConsultationStatus.ENDED).toBe('ENDED');
  });

  it('should have CANCELLED status', () => {
    expect(ConsultationStatus.CANCELLED).toBeDefined();
    expect(ConsultationStatus.CANCELLED).toBe('CANCELLED');
  });

  it('should have all expected statuses', () => {
    const statuses = Object.values(ConsultationStatus);
    expect(statuses).toContain('SCHEDULED');
    expect(statuses).toContain('ACTIVE');
    expect(statuses).toContain('ENDED');
    expect(statuses).toContain('CANCELLED');
    expect(statuses.length).toBe(4);
  });
});
