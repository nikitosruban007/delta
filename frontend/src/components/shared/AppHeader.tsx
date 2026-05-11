"use client";

import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import BrandMark from "./BrandMark";

export interface AppHeaderProps {
  backHref?: string;
  backLabel?: string;
  showLanguageToggle?: boolean;
  showNotifications?: boolean;
  className?: string;
}

export default function AppHeader({
  backHref,
  backLabel,
  showLanguageToggle = false,
  showNotifications = false,
  className = "bg-[#1B345B] shadow-md",
}: AppHeaderProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <header className={`flex min-h-[72px] items-center justify-between px-5 md:px-8 text-white shrink-0 ${className}`}>
      {backHref && backLabel ? (
        <Link
          href={backHref}
          className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-4 md:px-5 py-2 md:py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
        >
          <ArrowLeft className="size-4" />
          <span className="leading-none">{backLabel}</span>
        </Link>
      ) : (
        <div /> 
      )}

      <div className="flex items-center gap-4 md:gap-6">
        {showNotifications && (
          <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 transition hover:bg-white/10">
            <Bell size={18} className="text-white" />
          </button>
        )}

        {showLanguageToggle && (
          <div className="hidden sm:flex items-center gap-3 text-sm font-medium">
            <button
              type="button"
              onClick={() => setLanguage("uk")}
              className={`transition hover:text-[#dce9ff] ${language === "uk" ? "text-white underline decoration-1 underline-offset-2" : "text-[#93a6c4]"}`}
            >
              UKR
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`transition hover:text-[#d4e2f7] ${language === "en" ? "text-white underline decoration-1 underline-offset-2" : "text-[#93a6c4]"}`}
            >
              ENG
            </button>
          </div>
        )}

        {/* BrandMark is the standard FoldUp logo with text */}
        <div className="scale-75 origin-right">
          <BrandMark dark />
        </div>
      </div>
    </header>
  );
}
