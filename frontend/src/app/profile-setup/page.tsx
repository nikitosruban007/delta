import Link from "next/link";

import { AuthHeader } from "@/components/shared/AuthShell";
import { DotGrid, SoftPageBackground } from "@/components/shared/Decor";

export default function ProfileSetupPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] text-[#061733]">
      <AuthHeader />
      <section className="relative isolate mx-auto min-h-[calc(100vh-86px)] w-full max-w-[1440px] overflow-hidden px-5 py-12 md:px-12">
        <SoftPageBackground />
        <DotGrid className="left-10 top-24 opacity-70 md:left-28" />

        <div className="relative z-10 flex min-h-[calc(100vh-190px)] flex-col justify-between gap-12">
          <div className="max-w-[840px] pt-8 md:pt-20">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1f62df]">Налаштування профілю</p>
            <p className="mt-6 text-[30px] font-semibold leading-snug text-[#061733] md:text-[38px]">
              Користувач заповнює дані для свого акаунту, а також вказує свої навички, підтвердження особи студента, або ж учня (дата народження)
            </p>
            <p className="mt-14 text-[34px] font-semibold text-[#061733] md:text-[42px]">Share ID</p>
          </div>

          <div className="flex justify-end pb-8">
            <Link
              href="/dashboard"
              className="inline-flex min-w-full items-center justify-center rounded-[16px] bg-[#5f72df] px-8 py-4 text-[34px] font-extrabold leading-tight text-[#111f4f] shadow-[0_18px_40px_rgba(95,114,223,0.26)] transition hover:bg-[#6a7de5] sm:min-w-[370px] md:text-[46px]"
            >
              Пропустити
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
