export class PermissionCode {
  private constructor(public readonly value: string) {}

  static create(code: string): PermissionCode {
    const normalized = code.trim();
    if (!normalized) {
      throw new Error('Permission code cannot be empty');
    }
    return new PermissionCode(normalized);
  }

  toString(): string {
    return this.value;
  }
}
