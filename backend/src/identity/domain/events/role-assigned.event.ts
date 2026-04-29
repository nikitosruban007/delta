export class RoleAssignedEvent {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly assignedBy: string | null,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
