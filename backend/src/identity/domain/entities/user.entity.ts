import { Email } from '../value-objects/email.vo';

export class User {
  constructor(
    public readonly id: string,
    public email: Email,
    public passwordHash: string,
    public name: string,
    public avatarUrl: string | null,
    public isActive: boolean,
    public readonly createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  rename(name: string) {
    if (!name.trim()) throw new Error('Name cannot be empty');
    this.name = name.trim();
  }

  changeAvatar(avatarUrl: string | null) {
    this.avatarUrl = avatarUrl;
  }

  deactivate() {
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
  }
}
