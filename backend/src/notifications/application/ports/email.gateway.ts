export type EmailMessage = {
  recipientId: string;
  recipientEmail: string;
  subject: string;
  body: string;
};

export abstract class EmailGateway {
  abstract send(message: EmailMessage): Promise<void>;
}
