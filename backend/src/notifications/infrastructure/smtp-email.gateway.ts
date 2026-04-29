import nodemailer, { Transporter } from 'nodemailer';
import { EmailGateway, EmailMessage } from '../application/ports/email.gateway';
import { SmtpEmailSettings } from './notification-email-settings';

export class SmtpEmailGateway extends EmailGateway {
  private readonly transporter: Transporter;

  constructor(private readonly smtp: SmtpEmailSettings) {
    super();
    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.smtp.from,
      to: message.recipientEmail,
      subject: message.subject,
      text: message.body,
    });
  }
}
