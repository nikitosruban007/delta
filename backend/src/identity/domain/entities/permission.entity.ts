export class Permission {
  constructor(
    public readonly id: string,
    public code: string,
    public description: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    if (!code.trim()) throw new Error('Permission code cannot be empty');
    this.code = code.trim();
  }

  rename(code: string) {
    if (!code.trim()) throw new Error('Permission code cannot be empty');
    this.code = code.trim();
  }

  setDescription(description: string | null) {
    this.description = description;
  }
}
