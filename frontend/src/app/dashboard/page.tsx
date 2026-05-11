"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  Bell,
  ChevronDown,
  Flag,
  GraduationCap,
  History,
  Loader2,
  MessageCircle,
  Play,
  Search,
  Settings,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { tournamentsApi, type TournamentStatus, type Tournament } from "@/lib/api";
import Footer from "@/components/shared/Footer";

type TabKey = "upcoming" | "registration" | "current" | "finished";

function TournamentCard({
  tournament,
  tabKey,
}: {
  tournament: Tournament;
  tabKey: TabKey;
}) {
  const { t } = useLanguage();
  const statusConfig: Record<
    TabKey,
    { topBg: string; bottomBg: string; pillBg: string; buttonBg: string; label: string; textColor: string; iconClass: string }
  > = {
    finished: {
      topBg: "bg-[#636363]",
      bottomBg: "bg-[#D0D0D0]",
      pillBg: "bg-[#636363]",
      buttonBg: "bg-[#636363]",
      label: t("dashboard.tabs.finished"),
      textColor: "text-white",
      iconClass: "brightness-0 invert",
    },
    current: {
      topBg: "bg-[#85AAEA]",
      bottomBg: "bg-white",
      pillBg: "bg-[#0E274A]",
      buttonBg: "bg-[#85AAEA]",
      label: t("dashboard.tabs.current"),
      textColor: "text-[#111111]",
      iconClass: "brightness-0",
    },
    registration: {
      topBg: "bg-[#85AAEA]",
      bottomBg: "bg-white",
      pillBg: "bg-[#F4A237]",
      buttonBg: "bg-[#85AAEA]",
      label: t("dashboard.tabs.registration"),
      textColor: "text-[#111111]",
      iconClass: "brightness-0",
    },
    upcoming: {
      topBg: "bg-[#85AAEA]",
      bottomBg: "bg-white",
      pillBg: "bg-[#D956D8]",
      buttonBg: "bg-[#85AAEA]",
      label: t("dashboard.tabs.upcoming"),
      textColor: "text-[#111111]",
      iconClass: "brightness-0",
    },
  };
  const cfg = statusConfig[tabKey];
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px] border border-[#E0E0E0] bg-white shadow-sm">
      <div className={`flex items-center gap-3 px-5 py-4 ${cfg.topBg}`}>
        <h3 className={`text-[14px] font-semibold underline underline-offset-2 ${cfg.textColor}`}>
          {tournament.title}
        </h3>
      </div>
      <div className={`flex flex-1 flex-col p-5 ${cfg.bottomBg}`}>
        <p className="line-clamp-3 text-[12px] leading-relaxed text-[#444]">
          {tournament.description ?? t("jury.eco.no_desc")}
        </p>
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <span className="mb-1 block text-[10px] font-medium text-[#666]">{t("dashboard.tournament.status")}:</span>
            <span className={`inline-block rounded-full px-5 py-1.5 text-[10px] font-semibold text-white ${cfg.pillBg}`}>
              {cfg.label}
            </span>
          </div>
          <Link
            href={`/tournaments/${tournament.id}`}
            className={`inline-block rounded-full px-6 py-2 text-[11px] font-semibold text-white transition hover:opacity-90 ${cfg.buttonBg}`}
          >
            {t("dashboard.tournament.go_to")} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { user, logout, isLoading, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("registration");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const tabs = [
    { key: "upcoming" as TabKey, label: t("dashboard.tabs.upcoming"), icon: History, apiStatus: "draft" as TournamentStatus },
    { key: "registration" as TabKey, label: t("dashboard.tabs.registration"), icon: Zap, apiStatus: "registration" as TournamentStatus },
    { key: "current" as TabKey, label: t("dashboard.tabs.current"), icon: Play, apiStatus: "active" as TournamentStatus },
    { key: "finished" as TabKey, label: t("dashboard.tabs.finished"), icon: Flag, apiStatus: "finished" as TournamentStatus },
  ] as const;

  const currentTabConfig = tabs.find((t) => t.key === activeTab)!;

  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["tournaments", currentTabConfig.apiStatus],
    queryFn: () => tournamentsApi.list(currentTabConfig.apiStatus),
  });

  const filtered = (tournaments ?? []).filter((t) =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const visible = filtered.slice(0, visibleCount);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setVisibleCount(6);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F8FB]">
        <Loader2 className="size-10 animate-spin text-[#0E274A]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#F4F8FB] font-sans text-[#161616]">
      <header className="flex h-[72px] items-center justify-between bg-[#0E274A] px-8 text-white shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-[#D2E4F9] px-5 py-2.5 text-[14px] font-semibold text-[#0E274A] transition hover:bg-[#b8d4f5]"
        >
          <span className="text-lg leading-none">←</span> {t("dashboard.back")}
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

      <div className="w-full mx-auto flex max-w-[1340px] gap-8 px-8 py-8">
        <aside className="h-fit w-[250px] shrink-0 rounded-xl border border-[#E0E0E0] bg-white p-6 shadow-sm">
          <div className="relative flex flex-col items-center border-b border-[#E0E0E0] pb-6">
            <button className="absolute right-0 top-0 text-[#888] transition hover:text-[#111]">
              <Settings size={20} />
            </button>
            <div className="mt-2 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#8A8A8A] text-2xl font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <h2 className="mt-4 text-center text-[18px] font-semibold leading-tight text-[#111]">
              {user?.name ?? t("dashboard.sidebar.participant")}
            </h2>
            <span className="mt-3 block rounded-lg bg-[#D2E4F9] px-8 py-1.5 text-[13px] font-semibold text-[#0E274A]">
              {user?.roles?.[0] ?? t("dashboard.sidebar.participant")}
            </span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="mt-4 text-xs text-[#888] underline transition hover:text-red-500"
            >
              {t("dashboard.sidebar.logout")}
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-4 text-[13px] font-medium text-[#444]">
            <Link href="#" className="flex items-center justify-between transition hover:text-[#111]">
              <div className="flex items-center gap-3">
                <Users size={18} /> {t("dashboard.sidebar.teams")}
              </div>
              <span className="text-lg leading-none">→</span>
            </Link>
            <Link href="/consultations" className="flex items-center gap-3 transition hover:text-[#111]">
              <MessageCircle size={18} /> {t("consultations.title")}
            </Link>
            <Link href="/forum" className="flex items-center gap-3 transition hover:text-[#111]">
              <GraduationCap size={18} /> {t("forum.title")}
            </Link>
            <Link href="/archive" className="flex items-center justify-between transition hover:text-[#111]">
              <div className="flex items-center gap-3">
                <Archive size={18} /> {t("dashboard.sidebar.archive")}
              </div>
              <span className="text-lg leading-none">→</span>
            </Link>
            {(hasRole("JUDGE") || hasRole("ADMIN")) && (
              <Link href="/dashboard/jury" className="flex items-center gap-3 transition hover:text-[#111] text-[#6082e6]">
                <Star size={18} /> {t("dashboard.jury")}
              </Link>
            )}
            {(hasRole("ORGANIZER") || hasRole("ADMIN")) && (
              <Link href="/dashboard/organizer" className="flex items-center gap-3 transition hover:text-[#111] text-[#F4A237]">
                <Trophy size={18} /> {t("dashboard.organizer")}
              </Link>
            )}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-3 text-[26px] font-semibold text-[#111]">
            <img src="/image/orange_icon.png" alt="" className="h-6 w-auto" />
            {t("dashboard.tournaments.active")}
          </h1>
          <p className="mt-2 text-sm text-[#666]">{t("dashboard.welcome")}, {user?.name ?? ""}!</p>
        </div>
      </div>

      <div className="w-full bg-[#E4EDFA] py-3">
        <div className="w-full mx-auto flex max-w-[1340px] items-center justify-between px-8">
          <div className="flex gap-2 sm:gap-6">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("forum.search_placeholder")}
              className="w-[180px] bg-transparent text-[13px] text-[#111] outline-none placeholder:text-[#888]"
            />
          </div>
        </div>
      </div>

      <div className="w-full px-8 py-8">
        <div className="w-full mx-auto max-w-[1280px]">
          {tournamentsLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="size-10 animate-spin text-[#0E274A]" />
            </div>
          )}

          {!tournamentsLoading && visible.length === 0 && (
            <p className="py-20 text-center text-[#666]">
              {search ? t("common.nothing_found") : t("common.nothing_found")}
            </p>
          )}

          {!tournamentsLoading && visible.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} tabKey={activeTab} />
              ))}
            </div>
          )}

          {filtered.length > visibleCount && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setVisibleCount((v) => v + 6)}
                className="flex items-center gap-2 rounded-xl bg-[#D2E4F9] px-6 py-2.5 text-[13px] font-bold text-[#0E274A] transition hover:bg-[#b8d4f5]"
              >
                {t("common.see_more")} <ChevronDown size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
