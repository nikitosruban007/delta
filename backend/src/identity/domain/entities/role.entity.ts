export class Role {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {
    if (!name.trim()) throw new Error('Role name cannot be empty');
    this.name = name.trim();
  }

  rename(name: string) {
    if (!name.trim()) throw new Error('Role name cannot be empty');
    this.name = name.trim();
  }

  setDescription(description: string | null) {
    this.description = description;
  }
}
