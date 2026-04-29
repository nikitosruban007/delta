import { DomainError } from './domain.error';

export class InvalidPermissionCodeError extends DomainError {
  constructor() {
    super('Permission code cannot be empty');
  }
}
