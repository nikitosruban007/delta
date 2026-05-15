const isEnabledFlag = (value: string | undefined) =>
  value?.trim().toLowerCase() === 'true';

const hasConfiguredCredentials = (
  clientId: string | undefined,
  clientSecret: string | undefined,
) => Boolean(clientId?.trim() && clientSecret?.trim());

const readOptionalToggle = (
  flagName: string,
  clientId: string | undefined,
  clientSecret: string | undefined,
) => {
  const explicitFlag = process.env[flagName];
  if (explicitFlag !== undefined) {
    return isEnabledFlag(explicitFlag);
  }

  return hasConfiguredCredentials(clientId, clientSecret);
};

export const isGoogleAuthEnabled = () =>
  readOptionalToggle(
    'ENABLE_GOOGLE_AUTH',
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

export const isGithubAuthEnabled = () =>
  readOptionalToggle(
    'ENABLE_GITHUB_AUTH',
    process.env.GITHUB_CLIENT_ID,
    process.env.GITHUB_CLIENT_SECRET,
  );
