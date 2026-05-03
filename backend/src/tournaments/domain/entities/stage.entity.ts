import { StageStatus } from '../enums/stage-status.enum';

export class Stage {
  constructor(
    public readonly id: string,
    public tournamentId: string,
    public title: string,
    public description: string | null,
    public orderIndex: number,
    public status: StageStatus,
    public deadlineAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
