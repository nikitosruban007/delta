import { TournamentStatus } from '../enums/tournament-status.enum';

export class Tournament {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public organizerId: string,
    public status: TournamentStatus,
    public registrationDeadline: Date | null,
    public startsAt: Date | null,
    public endsAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
