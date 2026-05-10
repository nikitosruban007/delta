import { ScoreStatus } from '../enums/score-status.enum';

export class Submission {
  constructor(
    public readonly id: string,
    public stageId: string,
    public teamId: string,
    public contentUrl: string | null,
    public status: ScoreStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
