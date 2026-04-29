export class UserRole {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roleId: string,
    public readonly assignedBy: string | null,
    public readonly assignedAt: Date,
  ) {}
}
