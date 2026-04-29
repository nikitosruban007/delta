import { DomainError } from './domain.error';

export class InvalidEmailError extends DomainError {
  constructor() {
    super('Invalid email');
  }
}
