export class JudgeAssignment {
  constructor(
    public readonly id: string,
    public tournamentId: string,
    public judgeId: string,
    public stageId: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
