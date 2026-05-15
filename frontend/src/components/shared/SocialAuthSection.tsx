"use client";

import Image from "next/image";

import { assets } from "@/lib/assets";
import { authApi } from "@/lib/api";
import {
  hasSocialAuthEnabled,
  socialAuthEnabled,
  type SocialAuthProvider,
} from "@/lib/social-auth";

type SocialAuthSectionProps = {
  actionLabel: string;
};

const socialButtons: Array<{
  provider: SocialAuthProvider;
  ariaLabel: string;
  asset: typeof assets.google;
}> = [
  {
    provider: 'google',
    ariaLabel: 'Google',
    asset: assets.google,
  },
  {
    provider: 'github',
    ariaLabel: 'GitHub',
    asset: assets.github,
  },
];

export function SocialAuthSection({ actionLabel }: SocialAuthSectionProps) {
  if (!hasSocialAuthEnabled) {
    return null;
  }

  const handleSocialLogin = (provider: SocialAuthProvider) => {
    window.location.href = authApi.socialAuthUrl(provider);
  };

  return (
    <>
      <div className="my-6 border-t border-[#d8e0ed]" />

      <p className="mb-4 text-center text-lg font-semibold text-[#526079]">
        {actionLabel} через
      </p>
      <div className="mb-6 flex justify-center gap-5">
        {socialButtons
          .filter(({ provider }) => socialAuthEnabled[provider])
          .map(({ provider, ariaLabel, asset }) => (
            <button
              key={provider}
              type="button"
              aria-label={`${actionLabel} через ${ariaLabel}`}
              onClick={() => handleSocialLogin(provider)}
              className="rounded-2xl border border-[#d8e0ed] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Image src={asset} alt="" width={44} height={44} />
            </button>
          ))}
      </div>
    </>
  );
}