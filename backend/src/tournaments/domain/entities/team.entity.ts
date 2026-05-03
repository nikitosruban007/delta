import { TeamStatus } from '../enums/team-status.enum';

export class Team {
  constructor(
    public readonly id: string,
    public tournamentId: string,
    public captainId: string,
    public name: string,
    public status: TeamStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
