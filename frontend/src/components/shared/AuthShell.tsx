"use client";

import { Eye, EyeOff, Lock, Mail, User, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useState } from "react";

import { assets } from "@/lib/assets";
import { AccentDot, DotGrid, SoftPageBackground } from "./Decor";

export function AuthHeader() {
  return (
    <div className="w-full bg-[#062e64] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-5 md:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#cde3ff] px-5 py-2.5 text-sm font-semibold text-[#0a3268] shadow-[0_10px_30px_rgba(51,119,215,0.22)] transition hover:bg-[#dbecff] md:text-base"
        >
          <span aria-hidden>←</span>
          Повернутися
        </Link>
        <Link href="/" className="flex items-center gap-3" aria-label="FoldUp">
          <span className="text-[28px] font-medium leading-none tracking-tight text-white md:text-[34px]">
            FoldUp
          </span>
          <Image src={assets.mark} alt="" width={45} height={34} className="h-8 w-auto md:h-9" priority />
        </Link>
      </div>
    </div>
  );
}

export function AuthFooter() {
  return (
    <footer className="mt-auto w-full bg-[#cbcbcd] py-5 text-center text-[#484848]">
      <p className="text-sm">© 2026 FoldUp. Усі права захищено.</p>
      <p className="mt-2 text-xs">
        [Політика конфіденційності] | [Умови використання] | [Контакти]
      </p>
    </footer>
  );
}

export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#f8fbff] text-[#061733]">
      <AuthHeader />
      <section className="relative isolate mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1440px] flex-1 items-center justify-center overflow-hidden px-5 py-12">
        <SoftPageBackground />
        <AccentDot tone="orange" className="left-[22%] top-12 h-28 w-28" />
        <AccentDot tone="red" className="right-[20%] top-8 h-28 w-28" />
        <AccentDot tone="red" className="bottom-16 left-[24%] h-24 w-24" />
        <AccentDot tone="orange" className="bottom-10 right-[25%] h-28 w-28" />
        <DotGrid className="left-[17%] top-48 hidden md:block" />

        <div className="relative z-10 w-full max-w-[720px] rounded-[24px] border border-[#d8e0ed] bg-white/95 px-5 py-10 shadow-[0_24px_80px_rgba(11,37,75,0.14)] backdrop-blur md:px-12">
          <div className="mb-8 flex items-center justify-center gap-3">
            <h1 className="text-[30px] font-extrabold leading-none tracking-tight text-[#061733] underline underline-offset-8 decoration-2 md:text-[36px]">{title}</h1>
            <Image src={assets.mark} alt="" width={58} height={44} className="h-11 w-auto" priority />
          </div>
          {children}
        </div>
      </section>
      <AuthFooter />
    </main>
  );
}

type FieldProps = {
  icon: "user" | "user-round" | "mail" | "lock";
  placeholder: string;
  type?: string;
  autoComplete?: string;
};

export function Field({ icon, placeholder, type = "text", autoComplete }: FieldProps) {
  const Icon = icon === "mail" ? Mail : icon === "lock" ? Lock : icon === "user-round" ? UserRound : User;

  return (
    <label className="relative block">
      <Icon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6b7a8d]" aria-hidden />
      <input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-14 w-full rounded-lg bg-[#e8eaef] px-14 text-lg text-[#061733] outline-none transition placeholder:text-[#6b7a8d] focus:ring-2 focus:ring-[#74a9f5]/30"
      />
    </label>
  );
}

export function PasswordField({ placeholder, autoComplete }: { placeholder: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);

  return (
    <label className="relative block">
      <Lock className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6b7a8d]" aria-hidden />
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-14 w-full rounded-lg bg-[#e8eaef] px-14 pr-14 text-lg text-[#061733] outline-none transition placeholder:text-[#6b7a8d] focus:ring-2 focus:ring-[#74a9f5]/30"
      />
      <button
        type="button"
        onClick={() => setShow((value) => !value)}
        className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#6b7a8d] transition hover:bg-[#d8dde6]"
        aria-label={show ? "Приховати пароль" : "Показати пароль"}
      >
        {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </label>
  );
}

export function PrimarySubmitLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block w-full rounded-xl bg-[#74adfb] px-6 py-4 text-center text-[17px] font-semibold leading-tight text-[#0b3269] shadow-[0_14px_30px_rgba(60,126,219,0.24)] transition hover:bg-[#8fbeff]"
    >
      {children}
    </Link>
  );
}
