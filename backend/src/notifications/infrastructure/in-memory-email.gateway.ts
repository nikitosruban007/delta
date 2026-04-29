import { EmailGateway, EmailMessage } from '../application/ports/email.gateway';

export class InMemoryEmailGateway extends EmailGateway {
  private readonly sentEmails: EmailMessage[] = [];

  send(message: EmailMessage): Promise<void> {
    this.sentEmails.push(message);
    return Promise.resolve();
  }

  getSentEmails(): EmailMessage[] {
    return [...this.sentEmails];
  }
}
