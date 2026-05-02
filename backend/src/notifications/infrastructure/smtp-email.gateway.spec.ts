import nodemailer from 'nodemailer';
import { SmtpEmailGateway } from './smtp-email.gateway';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

describe('SmtpEmailGateway', () => {
  it('creates a transporter from settings and sends email messages', async () => {
    const sendMail = jest.fn().mockResolvedValue({ accepted: ['user@example.com'] });
    const createTransport = nodemailer.createTransport as jest.Mock;
    createTransport.mockReturnValue({ sendMail });

    const gateway = new SmtpEmailGateway({
      host: 'smtp.delta.dev',
      port: 587,
      secure: false,
      user: 'mailer',
      pass: 'secret',
      from: 'no-reply@delta.dev',
    });

    await gateway.send({
      recipientId: 'user-1',
      recipientEmail: 'user@example.com',
      subject: 'Subject',
      body: 'Body',
    });

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.delta.dev',
      port: 587,
      secure: false,
      auth: {
        user: 'mailer',
        pass: 'secret',
      },
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: 'no-reply@delta.dev',
      to: 'user@example.com',
      subject: 'Subject',
      text: 'Body',
    });
  });
});
