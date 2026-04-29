export class PasswordHash {
  private constructor(public readonly value: string) {}

  static create(hash: string): PasswordHash {
    const normalized = hash.trim();
    if (!normalized) {
      throw new Error('Password hash cannot be empty');
    }
    return new PasswordHash(normalized);
  }

  toString(): string {
    return this.value;
  }
}
