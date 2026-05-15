export type SocialAuthProvider = 'google' | 'github';

const readEnabledFlag = (value: string | undefined, fallback = true) => {
  if (value === undefined) {
    return fallback;
  }

  return value.trim().toLowerCase() === 'true';
};

export const socialAuthEnabled = {
  google: readEnabledFlag(process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH),
  github: readEnabledFlag(process.env.NEXT_PUBLIC_ENABLE_GITHUB_AUTH),
} as const;

export const hasSocialAuthEnabled =
  socialAuthEnabled.google || socialAuthEnabled.github;