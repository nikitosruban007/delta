"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface PageHeaderProps {
  backHref?: string;
  backText?: string;
  showLanguage?: boolean;
  showBell?: boolean;
  bgColor?: string;
}

export default function PageHeader({
  backHref = "/",
  backText = "Назад",
  showLanguage = false,
  showBell = false,
  bgColor = "bg-[#1B345B]",
}: PageHeaderProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <header className={`flex h-[72px] shrink-0 items-center justify-between px-8 text-white w-full ${bgColor}`}>
      <Link
        href={backHref}
        className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
      >
        <span className="text-lg leading-none">←</span> {backText}
      </Link>
      <div className="flex items-center gap-6">
        {showLanguage && (
          <div className="hidden sm:flex items-center gap-3 text-sm font-medium">
            <button
              type="button"
              onClick={() => setLanguage("uk")}
              className={`transition hover:text-white ${language === "uk" ? "underline decoration-1 underline-offset-2 text-white" : "text-[#a8b8d4]"}`}
            >
              UKR
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`transition hover:text-white ${language === "en" ? "underline decoration-1 underline-offset-2 text-white" : "text-[#a8b8d4]"}`}
            >
              ENG
            </button>
          </div>
        )}
        {showBell && (
          <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 transition hover:bg-white/10">
            <Bell size={18} className="text-white" />
          </button>
        )}
        <div className="flex items-center gap-3 select-none">
          <span className="text-[24px] font-semibold tracking-wide hidden sm:block">FoldUp</span>
          <img src="/image/logo.png" alt="FoldUp Logo" className="h-8 w-auto hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
