export class RoleName {
  private constructor(public readonly value: string) {}

  static create(name: string): RoleName {
    const normalized = name.trim();
    if (!normalized) {
      throw new Error('Role name cannot be empty');
    }
    return new RoleName(normalized);
  }

  toString(): string {
    return this.value;
  }
}
