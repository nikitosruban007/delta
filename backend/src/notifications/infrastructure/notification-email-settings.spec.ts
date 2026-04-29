import { resolveNotificationsEmailSettings } from './notification-email-settings';

describe('resolveNotificationsEmailSettings', () => {
  it('returns in-memory provider by default', () => {
    const settings = resolveNotificationsEmailSettings({});

    expect(settings).toEqual({
      provider: 'in-memory',
    });
  });

  it('returns smtp settings for valid environment variables', () => {
    const settings = resolveNotificationsEmailSettings({
      NOTIFICATIONS_EMAIL_PROVIDER: 'smtp',
      NOTIFICATIONS_EMAIL_FROM: 'no-reply@delta.dev',
      NOTIFICATIONS_SMTP_HOST: 'smtp.delta.dev',
      NOTIFICATIONS_SMTP_PORT: '587',
      NOTIFICATIONS_SMTP_SECURE: 'false',
      NOTIFICATIONS_SMTP_USER: 'mailer',
      NOTIFICATIONS_SMTP_PASS: 'secret',
    });

    expect(settings).toEqual({
      provider: 'smtp',
      smtp: {
        host: 'smtp.delta.dev',
        port: 587,
        secure: false,
        user: 'mailer',
        pass: 'secret',
        from: 'no-reply@delta.dev',
      },
    });
  });

  it('throws error for unsupported provider', () => {
    expect(() =>
      resolveNotificationsEmailSettings({
        NOTIFICATIONS_EMAIL_PROVIDER: 'sendgrid',
      }),
    ).toThrow('Unsupported NOTIFICATIONS_EMAIL_PROVIDER value');
  });

  it('throws error when smtp settings are incomplete', () => {
    expect(() =>
      resolveNotificationsEmailSettings({
        NOTIFICATIONS_EMAIL_PROVIDER: 'smtp',
      }),
    ).toThrow('Missing required environment variable');
  });
});
