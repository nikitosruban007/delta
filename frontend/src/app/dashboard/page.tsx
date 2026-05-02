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

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";

const activeCards = [
  { icon: Gamepad2, tint: "text-[#3b8c29]", bg: "bg-[#f1ffe8]" },
  { icon: Trophy, tint: "text-[#3b8c29]", bg: "bg-[#f3ffe9]" },
  { icon: Swords, tint: "text-[#3b8c29]", bg: "bg-[#f2ffe9]" },
];

const tournamentCards = [
  Trophy,
  Gamepad2,
  Star,
  ShieldCheck,
  Users,
  Flag,
];

function ActiveTournamentCard({ icon: Icon, tint, bg }: (typeof activeCards)[number]) {
  return (
    <article className={`relative overflow-hidden rounded-[8px] border border-[#dce4f0] ${bg} p-5 shadow-[0_12px_30px_rgba(18,54,103,0.08)]`}>
      <DotGrid className="-left-4 bottom-2 h-24 w-24 opacity-50" />
      <div className="relative flex gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className={`size-8 ${tint}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold text-[#061733]">Назва турніру</h2>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-[#243047]">Коротко опис турніру, його мета ........................................</p>
          <p className="mt-6 text-right text-sm text-[#7a8597]">#Список шостий</p>
          <div className="mt-3 text-right">
            <button type="button" className="rounded-xl bg-[#5f72df] px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(95,114,223,0.18)] transition hover:bg-[#5264ce]">
              Перейти до турніру <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function TournamentCard({ icon: Icon }: { icon: (typeof tournamentCards)[number] }) {
  return (
    <article className="flex min-h-[150px] gap-5 rounded-[8px] border border-[#dce4f0] bg-white p-5 shadow-[0_12px_30px_rgba(18,54,103,0.06)]">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-[16px] bg-[#eef0ff] text-[#2f5bd6]">
        <Icon className="size-8" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-[#061733]">Назва турніру</h3>
          <p className="mt-2 text-sm leading-6 text-[#243047]">Коротко опис турніру, які будуть завдання та критерії</p>
        </div>
        <div className="mt-4 text-right">
          <button type="button" className="rounded-xl bg-[#5f72df] px-5 py-2 text-sm font-extrabold text-white transition hover:bg-[#5264ce]">
            Дізнатися більше <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const userEmail = "delta.group404@gmail.com";

  return (
    <main className="min-h-screen bg-[#f8fbff] text-[#061733]">
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

      <section className="relative mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-8 lg:grid-cols-[280px_1fr] lg:px-12">
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
              {[
                [CalendarDays, "МАЙБУТНІ ТУРНІРИ"],
                [Gamepad2, "РЕЄСТРАЦІЯ"],
                [Play, "ПОТОЧНІ ТУРНІРИ"],
                [Flag, "ЗАКІНЧЕНІ"],
              ].map(([Icon, label], index) => (
                <button
                  type="button"
                  key={label as string}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-[#eef4ff] ${index === 1 ? "border-b-2 border-[#5f72df] text-[#1f62df]" : ""}`}
                >
                  <Icon className="size-5" /> {label as string}
                </button>
              ))}
            </nav>
            <label className="flex h-11 items-center gap-3 rounded-xl border border-[#d8e0ed] bg-white px-4 text-[#7a8597]">
              <Search className="size-5" />
              <input type="text" placeholder="Пошук..." className="w-full bg-transparent text-sm outline-none placeholder:text-[#7a8597] xl:w-40" />
            </label>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {tournamentCards.map((Icon, index) => (
              <TournamentCard key={index} icon={Icon} />
            ))}
          </div>

          <div className="mt-6 text-center">
            <button type="button" className="inline-flex min-w-[220px] items-center justify-center gap-3 rounded-full border border-[#d8e0ed] bg-white px-8 py-3 font-extrabold text-[#0a3268] transition hover:bg-[#eef4ff]">
              Показати ще <ChevronDown className="size-5" />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
