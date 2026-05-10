"use client";

import Link from "next/link";

import BrandMark from "./BrandMark";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#062e64] shadow-[0_12px_32px_rgba(5,28,64,0.18)]">
      <div className="mx-auto flex h-[64px] w-full max-w-[1440px] items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 md:px-12 lg:pl-28 lg:pr-8 xl:pl-36 xl:pr-10">
        <BrandMark />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-5 lg:gap-6">
          <div className="flex items-center gap-3 text-[13px] font-bold sm:gap-4 sm:text-[15px] md:text-[17px]">
            <button
              type="button"
              onClick={() => setLanguage("uk")}
              aria-pressed={language === "uk"}
              className={`transition hover:text-[#dce9ff] ${language === "uk" ? "text-white" : "text-[#93a6c4]"}`}
            >
              UKR
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              className={`transition hover:text-[#d4e2f7] ${language === "en" ? "text-white" : "text-[#93a6c4]"}`}
            >
              ENG
            </button>
          </div>
          {!isLoading &&
            (isAuthenticated ? (
              <Link
                href="/dashboard"
                className="hidden items-center gap-3 rounded-[15px] border border-[#8bbdff] bg-[#164984] px-4 py-2.5 text-[15px] font-semibold text-[#e7f2ff] transition hover:bg-[#1a5aa0] md:inline-flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8bbdff] text-[13px] font-bold text-[#062e64]">
                  {user?.name?.[0]?.toUpperCase() ?? "A"}
                </span>
                {t("nav.account")} <span aria-hidden>→</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden items-center gap-1 rounded-[15px] border border-[#8bbdff] px-6 py-2.5 text-[16px] font-semibold text-[#e7f2ff] transition hover:bg-[#164984] md:inline-flex"
                >
                  {t("nav.login")} <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden items-center gap-1 rounded-[15px] border border-[#8bbdff] bg-[#164984] px-5 py-2.5 text-[16px] font-semibold text-[#e7f2ff] transition hover:bg-[#1a5aa0] md:inline-flex"
                >
                  {t("nav.register")} <span aria-hidden>→</span>
                </Link>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
