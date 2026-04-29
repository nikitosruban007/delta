import { DomainError } from './domain.error';

export class InvalidRoleNameError extends DomainError {
  constructor() {
    super('Role name cannot be empty');
  }
}
