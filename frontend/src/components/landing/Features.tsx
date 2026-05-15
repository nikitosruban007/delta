"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { DotGrid } from "@/components/shared/Decor";
import { assets } from "@/lib/assets";
import { useLanguage } from "@/contexts/language-context";

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <Image src={assets.mark} alt="" width={32} height={24} className={`h-6 w-auto ${className}`} />
  );
}

export default function Features() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1160px] space-y-12 px-5 py-14 md:px-8 md:py-18">
        <DotGrid className="left-6 top-10 opacity-50 md:left-12" />

        <div className="grid gap-8 md:grid-cols-[1fr_220px] md:items-center">
          <div className="space-y-4 text-base leading-7 text-[#061733] md:text-lg">
            <p>{t("landing.features.intro1")}</p>
            <p>{t("landing.features.intro2")}</p>
          </div>
          <Image
            src={assets.landing.problem}
            alt={t("landing.features.img_alt")}
            width={220}
            height={152}
            className="mx-auto w-[180px] rounded-[8px] shadow-[0_18px_42px_rgba(18,54,103,0.1)] md:w-[220px]"
          />
        </div>

        <div id="audience" className="space-y-5">
          <h2 className="flex items-center gap-3 text-[34px] font-black leading-tight text-[#061733] md:text-[48px]">
            <StarIcon /> {t("landing.audience.title")}
          </h2>
          <div className="overflow-hidden rounded-[16px] border border-[#dce4f0] bg-white shadow-[0_18px_60px_rgba(18,54,103,0.08)] md:grid md:grid-cols-[300px_1fr]">
            <Image
              src={assets.landing.hands}
              alt={t("landing.audience.img_alt")}
              width={346}
              height={438}
              className="h-full max-h-[330px] w-full object-cover md:max-h-none"
            />
            <div className="bg-[#eef1f6] p-5 text-base leading-7 text-[#061733] md:p-8">
              <p className="mb-4">{t("landing.audience.intro")}</p>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <strong>{t("landing.audience.students.title")}</strong>{" "}
                  {t("landing.audience.students.desc")}
                </li>
                <li>
                  <strong>{t("landing.audience.mentors.title")}</strong>{" "}
                  {t("landing.audience.mentors.desc")}
                </li>
                <li>
                  <strong>{t("landing.audience.peers.title")}</strong>{" "}
                  {t("landing.audience.peers.desc")}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="flex items-center gap-3 text-[34px] font-black leading-tight text-[#061733] md:text-[48px]">
            <StarIcon /> {t("landing.achievements.title")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Image
              src={assets.landing.achiv1}
              alt={t("landing.achievements.img1_alt")}
              width={624}
              height={245}
              className="h-full min-h-[170px] w-full rounded-[8px] object-cover shadow-[0_14px_34px_rgba(18,54,103,0.08)]"
            />
            <div className="relative">
              <Image
                src={assets.landing.achiv2}
                alt={t("landing.achievements.img2_alt")}
                width={624}
                height={245}
                className="h-full min-h-[170px] w-full rounded-[8px] object-cover shadow-[0_14px_34px_rgba(18,54,103,0.08)]"
              />
              <Image
                src={assets.landing.arrow}
                alt=""
                width={44}
                height={50}
                className="pointer-events-none absolute bottom-3 right-3"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-[16px] border border-[#dce4f0] bg-[#eef1f6] shadow-[0_18px_60px_rgba(18,54,103,0.08)] md:grid md:grid-cols-[1fr_270px]">
            <div className="p-5 text-base leading-7 text-[#061733] md:p-8">
              <p className="mb-4">{t("landing.achievements.intro")}</p>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <strong>{t("landing.achievements.efficiency.title")}</strong>{" "}
                  {t("landing.achievements.efficiency.desc")}
                </li>
                <li>
                  <strong>{t("landing.achievements.tech.title")}</strong>{" "}
                  {t("landing.achievements.tech.desc")}
                </li>
                <li>
                  <strong>{t("landing.achievements.future.title")}</strong>{" "}
                  {t("landing.achievements.future.desc")}
                </li>
              </ul>
            </div>
            <Image
              src={assets.landing.office}
              alt={t("landing.achievements.img3_alt")}
              width={340}
              height={438}
              className="h-full max-h-[320px] w-full object-cover md:max-h-none"
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-[36px] font-black text-[#061733] md:text-[42px]">
            {t("landing.cta.title")}
          </h2>
          <p className="mt-2 text-lg text-[#526079]">{t("landing.cta.subtitle")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/dashboard"
              className="rounded-[16px] bg-[#ff9812] px-8 py-3 text-[15px] font-bold text-white shadow-[0_18px_36px_rgba(255,152,18,0.28)] transition hover:bg-[#ef8700]"
            >
              {t("landing.cta.find_btn")}
            </Link>
            <Link
              href="/register"
              className="rounded-[16px] bg-[#f2474e] px-8 py-3 text-[15px] font-bold text-white shadow-[0_18px_36px_rgba(242,71,78,0.24)] transition hover:bg-[#df3941]"
            >
              {t("landing.cta.reg_btn")}
            </Link>
          </div>
        </div>

        <div
          id="contacts"
          className="rounded-[18px] border border-[#dce4f0] bg-white p-6 shadow-[0_18px_50px_rgba(18,54,103,0.08)] md:grid md:grid-cols-[1fr_1.2fr] md:items-center md:p-10"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1f62df]">
              <Phone className="size-11" />
            </div>
            <div>
              <h2 className="text-[28px] font-black text-[#061733] md:text-[34px]">
                {t("landing.contacts.title")}
              </h2>
              <p className="mt-3 text-lg leading-7 text-[#526079]">
                {t("landing.contacts.subtitle")}
              </p>
            </div>
          </div>
          <div className="mt-8 space-y-4 border-[#d8e0ed] md:mt-0 md:border-l md:pl-10">
            <p className="flex items-center gap-4 break-words text-lg text-[#061733]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#1f62df]">
                <Mail className="size-6" />
              </span>
              delta.group404@gmail.com
            </p>
            <p className="flex items-center gap-4 text-lg text-[#061733]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#1f62df]">
                <Phone className="size-6" />
              </span>
              398-288-4208 ×609
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
