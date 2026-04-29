export type SmtpEmailSettings = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export type NotificationsEmailSettings =
  | {
      provider: 'in-memory';
    }
  | {
      provider: 'smtp';
      smtp: SmtpEmailSettings;
    };

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off']);

function getRequiredValue(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function parseBooleanEnv(value: string, key: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  throw new Error(
    `Environment variable ${key} must be a boolean value (true/false)`,
  );
}

function parsePort(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      'Environment variable NOTIFICATIONS_SMTP_PORT must be a positive integer',
    );
  }

  return parsed;
}

export function resolveNotificationsEmailSettings(
  env: NodeJS.ProcessEnv,
): NotificationsEmailSettings {
  const provider = (
    env.NOTIFICATIONS_EMAIL_PROVIDER ?? 'in-memory'
  ).toLowerCase();

  if (provider === 'in-memory') {
    return {
      provider: 'in-memory',
    };
  }

  if (provider !== 'smtp') {
    throw new Error(
      `Unsupported NOTIFICATIONS_EMAIL_PROVIDER value: ${provider}`,
    );
  }

  return {
    provider: 'smtp',
    smtp: {
      host: getRequiredValue(env, 'NOTIFICATIONS_SMTP_HOST'),
      port: parsePort(getRequiredValue(env, 'NOTIFICATIONS_SMTP_PORT')),
      secure: parseBooleanEnv(
        env.NOTIFICATIONS_SMTP_SECURE ?? 'false',
        'NOTIFICATIONS_SMTP_SECURE',
      ),
      user: getRequiredValue(env, 'NOTIFICATIONS_SMTP_USER'),
      pass: getRequiredValue(env, 'NOTIFICATIONS_SMTP_PASS'),
      from: getRequiredValue(env, 'NOTIFICATIONS_EMAIL_FROM'),
    },
  };
}
