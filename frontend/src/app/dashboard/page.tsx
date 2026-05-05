"use client";

import {
  Bell,
  CalendarDays,
  ChevronDown,
  Flag,
  Gamepad2,
  Mail,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Swords,
  Trophy,
  User,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { type ComponentType, useMemo, useState } from "react";

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";

const activeCards = [
  {
    icon: Gamepad2,
    tint: "text-[#3b8c29]",
    bg: "bg-[#f1ffe8]",
    title: "CODE & PLAY: ECO-QUEST",
    description: "Командам потрібно за 48 годин розробити прототип браузерної міні-гри на тему екології та сталого розвитку.",
    href: "/tournaments/code-play-eco-quest",
  },
  {
    icon: Trophy,
    tint: "text-[#3b8c29]",
    bg: "bg-[#f3ffe9]",
    title: "City Challenge",
    description: "Хакатон для створення smart-city рішень з акцентом на транспорт, безпеку та open data.",
    href: "/tournaments/city-challenge",
  },
  {
    icon: Swords,
    tint: "text-[#3b8c29]",
    bg: "bg-[#f2ffe9]",
    title: "Edu Sprint",
    description: "Змагання з розробки освітніх інструментів, що допоможуть викладачам автоматизувати навчальні процеси.",
    href: "/tournaments/edu-sprint",
  },
];

type TournamentStatus = "upcoming" | "registration" | "current" | "finished";

const tournamentCards = [
  {
    icon: Trophy,
    title: "Cyber Defense Cup",
    description: "Практичний турнір із кібербезпеки та командних сценаріїв захисту.",
    href: "/tournaments/cyber-defense-cup",
    status: "registration" as TournamentStatus,
  },
  {
    icon: Gamepad2,
    title: "AI for Good",
    description: "Створення AI-рішень для освітніх і соціально важливих задач.",
    href: "/tournaments/ai-for-good",
    status: "upcoming" as TournamentStatus,
  },
  {
    icon: Star,
    title: "Product UX Lab",
    description: "Інтенсив із UX, user flow та продуктового мислення в команді.",
    href: "/tournaments/product-ux-lab",
    status: "current" as TournamentStatus,
  },
  {
    icon: ShieldCheck,
    title: "Green Energy Hack",
    description: "Рішення для моніторингу та оптимізації споживання енергії.",
    href: "/tournaments/green-energy-hack",
    status: "current" as TournamentStatus,
  },
  {
    icon: Users,
    title: "City Challenge",
    description: "Smart-city кейси: транспорт, безпека, open data та сервіси міста.",
    href: "/tournaments/city-challenge",
    status: "registration" as TournamentStatus,
  },
  {
    icon: Flag,
    title: "Edu Sprint",
    description: "Освітні продукти для автоматизації навчальних процесів.",
    href: "/tournaments/edu-sprint",
    status: "finished" as TournamentStatus,
  },
  {
    icon: CalendarDays,
    title: "Code & Play: Eco-Quest",
    description: "Еко-геймдев турнір для прототипу браузерної міні-гри.",
    href: "/tournaments/code-play-eco-quest",
    status: "registration" as TournamentStatus,
  },
  {
    icon: Play,
    title: "Robotics League",
    description: "Командні змагання з робототехніки та автономних сценаріїв.",
    href: "/tournaments/city-challenge",
    status: "upcoming" as TournamentStatus,
  },
  {
    icon: Swords,
    title: "Dev Arena",
    description: "Швидкі раунди реалізації фіч із фокусом на якість коду.",
    href: "/tournaments/ai-for-good",
    status: "current" as TournamentStatus,
  },
  {
    icon: Flag,
    title: "Math Quest",
    description: "Освітній турнір із математичних симуляцій та інтерактивних задач.",
    href: "/tournaments/edu-sprint",
    status: "finished" as TournamentStatus,
  },
];

const tabs: { key: TournamentStatus; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { key: "upcoming", label: "МАЙБУТНІ ТУРНІРИ", icon: CalendarDays },
  { key: "registration", label: "РЕЄСТРАЦІЯ", icon: Gamepad2 },
  { key: "current", label: "ПОТОЧНІ ТУРНІРИ", icon: Play },
  { key: "finished", label: "ЗАКІНЧЕНІ", icon: Flag },
];

function ActiveTournamentCard({ icon: Icon, tint, bg, title, description, href }: (typeof activeCards)[number]) {
  return (
    <article className={`relative overflow-hidden rounded-[8px] border border-[#dce4f0] ${bg} p-5 shadow-[0_12px_30px_rgba(18,54,103,0.08)]`}>
      <DotGrid className="-left-4 bottom-2 h-24 w-24 opacity-50" />
      <div className="relative flex gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className={`size-8 ${tint}`} />
        </div>
        <div className="flex min-h-[178px] min-w-0 flex-1 flex-col">
          <h2 className="text-xl font-extrabold text-[#061733]">{title}</h2>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-[#243047]">{description}</p>
          <p className="mt-auto pt-4 text-right text-sm text-[#7a8597]">#Список шостий</p>
          <div className="mt-3 text-right">
            <Link
              href={href}
              className="inline-flex min-w-[210px] items-center justify-center rounded-xl bg-[#5f72df] px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(95,114,223,0.18)] transition hover:bg-[#5264ce]"
            >
              Перейти до турніру <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function TournamentCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: (typeof tournamentCards)[number]["icon"];
  title: string;
  description: string;
  href: string;
}) {
  return (
    <article className="flex min-h-[150px] gap-5 rounded-[8px] border border-[#dce4f0] bg-white p-5 shadow-[0_12px_30px_rgba(18,54,103,0.06)]">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-[16px] bg-[#eef0ff] text-[#2f5bd6]">
        <Icon className="size-8" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-[#061733]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#243047]">{description}</p>
        </div>
        <div className="mt-4 text-right">
          <Link
            href={href}
            className="inline-flex min-w-[170px] items-center justify-center rounded-xl bg-[#5f72df] px-5 py-2 text-sm font-extrabold text-white transition hover:bg-[#5264ce]"
          >
            Дізнатися більше <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const userEmail = "delta.group404@gmail.com";
  const [activeTab, setActiveTab] = useState<TournamentStatus>("registration");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredCards = useMemo(
    () => tournamentCards.filter((card) => card.status === activeTab),
    [activeTab]
  );
  const visibleCards = filteredCards.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredCards.length;

  return (
    <main className="flex min-h-screen flex-col bg-[#f8fbff] text-[#061733]">
      <header className="bg-[#062e64]">
        <div className="mx-auto flex h-[86px] w-full max-w-[1440px] items-center justify-between px-5 md:px-12">
          <Link
            href="/"
            className="hidden rounded-full bg-[#cde3ff] px-5 py-2.5 text-sm font-semibold text-[#0a3268] shadow-[0_10px_30px_rgba(51,119,215,0.22)] transition hover:bg-[#dbecff] md:inline-flex"
          >
            ← Повернутися на головну сторінку
          </Link>
          <div className="md:hidden">
            <BrandMark />
          </div>
          <div className="flex items-center gap-5 text-white">
            <button type="button" aria-label="Сповіщення" className="rounded-full p-2 transition hover:bg-white/10">
              <Bell className="size-6" />
            </button>
            <button type="button" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-white text-lg font-bold text-[#061733]">N</span>
              <ChevronDown className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid w-full max-w-[1440px] flex-1 gap-8 px-5 py-8 lg:grid-cols-[280px_1fr] lg:px-12">
        <DotGrid className="right-16 top-8 hidden lg:block" />
        <AccentDot tone="orange" className="-right-5 top-8 h-9 w-9" />

        <aside className="relative overflow-hidden rounded-[8px] border border-[#dce4f0] bg-white p-6 shadow-[0_18px_60px_rgba(18,54,103,0.08)]">
          <AccentDot tone="red" className="-left-5 top-0 h-12 w-12" />
          <AccentDot tone="orange" className="right-0 top-28 h-7 w-7" />
          <AccentDot tone="red" className="-left-8 bottom-28 h-16 w-16" />
          <AccentDot tone="orange" className="bottom-10 right-10 h-10 w-10" />
          <AccentDot tone="blue" className="-bottom-8 -right-8 h-24 w-24 !bg-[#5f72df]" />

          <div className="relative flex justify-end">
            <button type="button" aria-label="Налаштування" className="rounded-full p-2 transition hover:bg-[#eef4ff]">
              <Settings className="size-6" />
            </button>
          </div>
          <div className="relative mx-auto mt-2 size-28 rounded-full border border-[#d8e0ed] bg-white p-3">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-[#e1e5eb] to-[#b8bec7]" />
          </div>
          <h1 className="relative mt-6 text-center text-2xl font-extrabold">Ім&apos;я Прізвище</h1>
          <p className="relative mx-auto mt-3 w-fit rounded-full bg-[#a7b0f6] px-5 py-1.5 text-sm font-bold text-[#1f3570]">учасник</p>

          <div className="relative mt-7 space-y-6 border-t border-[#d8e0ed] pt-7">
            <p className="flex gap-4 text-sm leading-5">
              <User className="size-5 shrink-0" />
              <span><strong className="block">Роль</strong>учасник</span>
            </p>
            <p className="flex gap-4 text-sm leading-5">
              <WalletCards className="size-5 shrink-0" />
              <span><strong className="block">Опис про себе</strong>................................</span>
            </p>
            <p className="flex gap-4 break-words text-sm leading-5">
              <Mail className="size-5 shrink-0" />
              <span><strong className="block">Електронна адреса</strong>{userEmail}</span>
            </p>
            <button type="button" className="flex items-center gap-4 text-sm font-bold transition hover:text-[#1f62df]">
              <WalletCards className="size-5" /> Архів турнірів →
            </button>
          </div>
        </aside>

        <div className="relative">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-[38px] font-black leading-tight md:text-[44px]">Твої активні турніри <span className="text-[#ffb21c]">╳</span></h1>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {activeCards.map((card, index) => (
              <ActiveTournamentCard key={index} {...card} />
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-[8px] border border-[#dce4f0] bg-white p-4 shadow-[0_12px_30px_rgba(18,54,103,0.06)] xl:flex-row xl:items-center xl:justify-between">
            <nav className="grid gap-2 text-sm font-extrabold text-[#0a3268] sm:grid-cols-2 xl:flex xl:items-center xl:gap-8">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => {
                    setActiveTab(key);
                    setVisibleCount(6);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-[#eef4ff] ${
                    activeTab === key ? "border-b-2 border-[#5f72df] text-[#1f62df]" : ""
                  }`}
                >
                  <Icon className="size-5" /> {label}
                </button>
              ))}
            </nav>
            <label className="flex h-11 items-center gap-3 rounded-xl border border-[#d8e0ed] bg-white px-4 text-[#7a8597]">
              <Search className="size-5" />
              <input type="text" placeholder="Пошук..." className="w-full bg-transparent text-sm outline-none placeholder:text-[#7a8597] xl:w-40" />
            </label>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {visibleCards.map((card) => (
              <TournamentCard key={`${card.href}-${card.title}`} {...card} />
            ))}
          </div>

          {filteredCards.length === 0 ? (
            <p className="mt-6 text-center text-sm font-semibold text-[#6c7890]">
              Для цього розділу турнірів поки немає.
            </p>
          ) : (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 3)}
                disabled={!canShowMore}
                className="inline-flex min-w-[220px] items-center justify-center gap-3 rounded-full border border-[#d8e0ed] bg-white px-8 py-3 font-extrabold text-[#0a3268] transition hover:bg-[#eef4ff] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
              >
                {canShowMore ? "Показати ще" : "Усі турніри показано"} <ChevronDown className="size-5" />
              </button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
