"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  ChevronDown,
  Flag,
  GraduationCap,
  History,
  MessageCircle,
  Play,
  Search,
  Users,
  Zap,
  Bell,
  Settings
} from "lucide-react";

type TournamentStatus = "upcoming" | "registration" | "current" | "finished";

const tabs = [
  { key: "upcoming", label: "МАЙБУТНІ ТУРНІРИ", icon: History },
  { key: "registration", label: "РЕЄСТРАЦІЯ", icon: Zap },
  { key: "current", label: "ПОТОЧНІ ТУРНІРИ", icon: Play },
  { key: "finished", label: "ЗАКІНЧЕНІ", icon: Flag },
] as const;

const statusConfig: Record<
  TournamentStatus,
  {
    topBg: string;
    bottomBg: string;
    pillBg: string;
    buttonBg: string;
    label: string;
    textColor: string;
    iconClass: string;
  }
> = {
  finished: {
    topBg: "bg-[#636363]",
    bottomBg: "bg-[#D0D0D0]",
    pillBg: "bg-[#636363]",
    buttonBg: "bg-[#636363]",
    label: "Закінчено",
    textColor: "text-white",
    iconClass: "brightness-0 invert",
  },
  current: {
    topBg: "bg-[#85AAEA]",
    bottomBg: "bg-white",
    pillBg: "bg-[#0E274A]",
    buttonBg: "bg-[#85AAEA]",
    label: "Поточний",
    textColor: "text-[#111111]",
    iconClass: "brightness-0",
  },
  registration: {
    topBg: "bg-[#85AAEA]",
    bottomBg: "bg-white",
    pillBg: "bg-[#F4A237]",
    buttonBg: "bg-[#85AAEA]",
    label: "Реєстрація",
    textColor: "text-[#111111]",
    iconClass: "brightness-0",
  },
  upcoming: {
    topBg: "bg-[#85AAEA]",
    bottomBg: "bg-white",
    pillBg: "bg-[#D956D8]",
    buttonBg: "bg-[#85AAEA]",
    label: "Майбутній",
    textColor: "text-[#111111]",
    iconClass: "brightness-0",
  },
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TournamentStatus>("current");
  const [visibleCount, setVisibleCount] = useState(6);

  const handleTabChange = (tab: TournamentStatus) => {
    setActiveTab(tab);
    setVisibleCount(6);
  };

  const handleShowMore = () => {
    setVisibleCount(15);
  };

  return (
    <main className="min-h-screen bg-[#F4F8FB] font-sans text-[#161616]">
      <header className="flex h-[72px] items-center justify-between bg-[#0E274A] px-8 text-white">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-[#D2E4F9] px-5 py-2.5 text-[14px] font-semibold text-[#0E274A] transition hover:bg-[#b8d4f5]"
        >
          <span className="text-lg leading-none">←</span> Повернутися
        </Link>
        <div className="flex items-center gap-6">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 transition hover:bg-white/10">
            <Bell size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[24px] font-semibold tracking-wide">FoldUp</span>
            <img src="/image/orange_icon.png" alt="FoldUp Logo" className="h-8 w-auto" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1340px] gap-8 px-8 py-8">
        <aside className="h-fit w-[250px] shrink-0 rounded-xl border border-[#E0E0E0] bg-white p-6 shadow-sm">
          <div className="relative flex flex-col items-center border-b border-[#E0E0E0] pb-6">
            <button className="absolute right-0 top-0 text-[#888] transition hover:text-[#111]">
              <Settings size={20} />
            </button>
            <div className="mt-2 h-[88px] w-[88px] rounded-full bg-[#8A8A8A]" />
            <h2 className="mt-4 text-center text-[18px] font-semibold leading-tight text-[#111]">
              Ім&apos;я
              <br />
              Прізвище
            </h2>
            <span className="mt-3 block rounded-lg bg-[#D2E4F9] px-8 py-1.5 text-[13px] font-semibold text-[#0E274A]">
              Учасник
            </span>
          </div>
          <nav className="mt-6 flex flex-col gap-4 text-[13px] font-medium text-[#444]">
            <Link href="#" className="flex items-center justify-between transition hover:text-[#111]">
              <div className="flex items-center gap-3">
                <Users size={18} /> Мої активні команди
              </div>
              <span className="text-lg leading-none">→</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 transition hover:text-[#111]">
              <MessageCircle size={18} /> Консультації
            </Link>
            <Link href="#" className="flex items-center gap-3 transition hover:text-[#111]">
              <GraduationCap size={18} /> Форум
            </Link>
            <Link href="#" className="flex items-center justify-between transition hover:text-[#111]">
              <div className="flex items-center gap-3">
                <Archive size={18} /> Архів турнірів
              </div>
              <span className="text-lg leading-none">→</span>
            </Link>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-semibold text-[#111]">Твої активні турніри</h1>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex gap-4 overflow-hidden">
              {Array(3)
                .fill(null)
                .map((_, i) => (
                  <div
                    key={i}
                    className="w-[280px] shrink-0 overflow-hidden rounded-[16px] border border-[#E0E0E0] bg-white shadow-sm"
                  >
                    <div className="flex items-center gap-3 bg-[#D0F46E] px-5 py-4">
                      <img src="/image/tour_vector.png" alt="Іконка" className="h-6 w-6 brightness-0" />
                      <h3 className="text-[14px] font-semibold text-[#111] underline underline-offset-2">
                        Назва турніру
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="text-[12px] leading-relaxed text-[#444]">
                        Коротко про опис
                        <br />
                        турніру...........................................
                      </p>
                      <div className="mt-6 text-right text-[10px] font-semibold text-[#0E274A]">
                        #Хештег1 #Хештег2 #Хештег3
                        <br />
                        #Хештег4
                      </div>
                      <div className="mt-4 text-right">
                        <Link
                          href="#"
                          className="inline-block rounded-full bg-[#85AAEA] px-6 py-2 text-[11px] font-semibold text-white transition hover:bg-[#7298db]"
                        >
                          Перейти до турніру →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex shrink-0 items-center pl-2">
              <button className="transition hover:scale-105">
                <img src="/image/arrow.png" alt="Гортати далі" className="h-8 w-8 opacity-70 hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#E4EDFA] py-3">
        <div className="mx-auto flex max-w-[1340px] items-center justify-between px-8">
          <div className="flex gap-2 sm:gap-6">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key as TournamentStatus)}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold transition-all ${
                  activeTab === key
                    ? "rounded-xl bg-white text-[#0E274A] shadow-sm"
                    : "text-[#0E274A] opacity-60 hover:opacity-100"
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
            <Search size={16} className="text-[#888]" />
            <input
              type="text"
              placeholder="Пошук..."
              className="w-[180px] bg-transparent text-[13px] text-[#111] outline-none placeholder:text-[#888]"
            />
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(visibleCount)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[16px] border border-[#E0E0E0] shadow-sm"
                >
                  <div className={`flex items-center gap-3 px-5 py-4 ${statusConfig[activeTab].topBg}`}>
                    <img
                      src="/image/tour_vector.png"
                      alt="Іконка"
                      className={`h-6 w-6 ${statusConfig[activeTab].iconClass}`}
                    />
                    <h3 className={`text-[14px] font-semibold underline underline-offset-2 ${statusConfig[activeTab].textColor}`}>
                      Назва турніру
                    </h3>
                  </div>
                  <div className={`p-5 ${statusConfig[activeTab].bottomBg}`}>
                    <p className="text-[12px] leading-relaxed text-[#444]">
                      Коротко про опис
                      <br />
                      турніру...........................................
                    </p>
                    <div className="mt-6 text-right text-[10px] font-semibold text-[#0E274A]">
                      #Хештег1 #Хештег2 #Хештег3
                      <br />
                      #Хештег4
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <span className="mb-1 block text-[10px] font-medium text-[#666]">Статус:</span>
                        <span
                          className={`inline-block rounded-full px-5 py-1.5 text-[10px] font-semibold text-white ${statusConfig[activeTab].pillBg}`}
                        >
                          {statusConfig[activeTab].label}
                        </span>
                      </div>
                      <Link
                        href="#"
                        className={`inline-block rounded-full px-6 py-2 text-[11px] font-semibold text-white transition hover:opacity-90 ${statusConfig[activeTab].buttonBg}`}
                      >
                        Перейти до турніру →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {visibleCount < 15 && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleShowMore}
                className="flex items-center gap-2 rounded-xl bg-[#D2E4F9] px-6 py-2.5 text-[13px] font-bold text-[#0E274A] transition hover:bg-[#b8d4f5]"
              >
                Дивитися більше <ChevronDown size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="w-full bg-[#EAEAEA] py-6 text-center text-[12px] font-medium text-[#666]">
        © 2026 FoldUp. Усі права захищено.
      </footer>
    </main>
  );
}