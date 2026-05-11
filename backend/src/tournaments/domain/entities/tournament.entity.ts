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
    public maxTeams: number | null = null,
    public teamSizeMin: number | null = null,
    public teamSizeMax: number | null = null,
    public rules: string | null = null,
  ) {}
}
