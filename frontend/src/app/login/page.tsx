"use client";

import Image from "next/image";
import Link from "next/link";

import { AuthShell, Field, PasswordField, PrimarySubmitLink } from "@/components/shared/AuthShell";
import { assets } from "@/lib/assets";

export default function LoginPage() {
  return (
    <AuthShell title="Вхід">
      <div className="space-y-4">
        <Field icon="user" placeholder="Логін" autoComplete="username" />
        <PasswordField placeholder="Пароль" autoComplete="current-password" />
        <div className="text-right">
          <button type="button" className="text-base font-medium text-[#526079] underline-offset-4 transition hover:text-[#1f62df] hover:underline">
            Забули пароль?
          </button>
        </div>
      </div>

      <div className="my-8 border-t border-[#d8e0ed]" />

      <p className="mb-4 text-center text-lg font-semibold text-[#526079]">Увійти через</p>
      <div className="mb-8 flex justify-center gap-5">
        <button type="button" aria-label="Увійти через Google" className="rounded-2xl border border-[#d8e0ed] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Image src={assets.google} alt="" width={44} height={44} />
        </button>
        <button type="button" aria-label="Увійти через GitHub" className="rounded-2xl border border-[#d8e0ed] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <Image src={assets.github} alt="" width={44} height={44} />
        </button>
      </div>

      <PrimarySubmitLink href="/profile-setup">Увійти</PrimarySubmitLink>

      <div className="mt-6 text-right">
        <Link href="/register" className="text-lg font-medium text-[#0a3268] underline transition hover:text-[#1f62df]">
          Ще не маєте акаунту?
        </Link>
      </div>
    </AuthShell>
  );
}
