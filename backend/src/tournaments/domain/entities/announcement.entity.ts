export class Announcement {
  constructor(
    public readonly id: string,
    public tournamentId: string,
    public authorId: string,
    public title: string,
    public body: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
