import { ParticipantRole } from './participant-role.enum';

describe('ParticipantRole Enum', () => {
  it('should have HOST role', () => {
    expect(ParticipantRole.HOST).toBeDefined();
    expect(ParticipantRole.HOST).toBe('HOST');
  });

  it('should have PARTICIPANT role', () => {
    expect(ParticipantRole.PARTICIPANT).toBeDefined();
    expect(ParticipantRole.PARTICIPANT).toBe('PARTICIPANT');
  });

  it('should have all expected roles', () => {
    const roles = Object.values(ParticipantRole);
    expect(roles).toContain('HOST');
    expect(roles).toContain('PARTICIPANT');
    expect(roles.length).toBe(2);
  });

  it('should differentiate between HOST and PARTICIPANT', () => {
    expect(ParticipantRole.HOST).not.toBe(ParticipantRole.PARTICIPANT);
  });
});
