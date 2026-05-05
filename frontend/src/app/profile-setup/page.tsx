import Link from "next/link";

import { AuthHeader } from "@/components/shared/AuthShell";
import { DotGrid, SoftPageBackground } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";

export default function ProfileSetupPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f8fbff] text-[#061733]">
      <AuthHeader />
      <section className="relative isolate mx-auto min-h-[calc(100vh-86px)] w-full max-w-[1440px] flex-1 overflow-hidden px-5 py-8 md:px-12">
        <SoftPageBackground />
        <DotGrid className="left-10 top-24 opacity-70 md:left-28" />

        <div className="relative z-10 flex min-h-[calc(100vh-220px)] flex-col justify-between gap-8">
          <div className="max-w-[620px] pt-4 md:pt-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1f62df] md:text-xs">Налаштування профілю</p>
            <p className="mt-4 text-xl font-semibold leading-snug text-[#061733] md:text-[26px]">
              Користувач заповнює дані для свого акаунту, а також вказує свої навички, підтвердження особи студента, або ж учня (дата народження)
            </p>
            <p className="mt-10 text-2xl font-semibold text-[#061733] md:text-[30px]">Share ID</p>
          </div>

          <div className="flex justify-end pb-4">
            <Link
              href="/dashboard"
              className="inline-flex min-w-full items-center justify-center rounded-[12px] bg-[#5f72df] px-6 py-3 text-2xl font-extrabold leading-tight text-[#111f4f] shadow-[0_14px_30px_rgba(95,114,223,0.26)] transition hover:bg-[#6a7de5] sm:min-w-[250px] md:text-[30px]"
            >
              Пропустити
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
