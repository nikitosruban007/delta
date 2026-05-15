"use client";

import Image from "next/image";
import Link from "next/link";

import { assets } from "@/lib/assets";
import { useLanguage } from "@/contexts/language-context";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section
      id="about"
      className="relative isolate overflow-hidden rounded-b-[28px] border-b border-[#c8d6ee] bg-[#eaf3ff]"
    >
      <Image src={assets.group} alt="" fill priority className="object-cover object-center" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/20 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto min-h-[460px] w-full max-w-[1440px] px-5 py-14 md:min-h-[500px] md:px-12">
        <div className="relative z-10 mt-16 max-w-[640px] md:ml-28">
          <h1 className="text-[48px] font-black leading-none tracking-[0.04em] text-[#06265a] drop-shadow-sm md:text-[64px]">
            {t("landing.hero.title")}
          </h1>
          <p className="mt-4 text-[18px] leading-tight text-[#3a4351] md:text-[20px]">
            {t("landing.hero.subtitle")}
          </p>
          <Link
            href="/dashboard"
            className="mt-7 inline-flex rounded-xl bg-[#ff9812] px-8 py-3 text-[15px] font-bold text-white shadow-[0_16px_32px_rgba(255,152,18,0.32)] transition hover:bg-[#ef8700]"
          >
            {t("landing.hero.btn")}
          </Link>
        </div>
      </div>
    </section>
  );
}
