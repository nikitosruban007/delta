import Link from "next/link";
import { ArrowDown, ArrowLeft, CalendarDays, CheckCircle2, ClipboardList, Info, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";
import { getTournamentById } from "@/lib/tournaments";

type TournamentPageProps = {
  params: Promise<{ id: string }>;
};

const criteria = {
  technical: [
    "Backend якість коду: clean code, патерни, ООП, стабільність, тести",
    "Database: наявність, налаштування, структура та зрозумілі зв'язки",
    "Frontend: clean code, UX/UI, відсутність помилок, адаптивність, тести",
  ],
  functional: [
    "Виконання вимог завдання та ключових must-have сценаріїв",
    "Роботоздатність, відсутність критичних багів, коректна взаємодія модулів",
    "Зручність використання, зрозумілий flow та завершеність рішення",
  ],
};

export default async function TournamentDetailsPage({ params }: TournamentPageProps) {
  const { id } = await params;
  const tournament = getTournamentById(id);

  if (!tournament) {
    notFound();
  }

  const stats = [
    { label: "Учасників в одній команді", value: tournament.mainInfo.teamSize },
    { label: "Кількість команд", value: tournament.mainInfo.teamsCount },
    { label: "Доступно місць", value: tournament.mainInfo.availableSlots },
    { label: "Кількість раундів", value: tournament.mainInfo.rounds },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#101724]">
      <header className="bg-[#0b3372] shadow-[0_10px_30px_rgba(11,51,114,0.18)]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#d8e8ff] px-4 py-2 text-sm font-semibold text-[#0a3268] transition hover:bg-[#e6f0ff]"
          >
            <ArrowLeft className="size-4" />
            Повернутися
          </Link>

          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-3 text-sm font-medium">
              <button type="button" className="underline decoration-1 underline-offset-2">
                UKR
              </button>
              <button type="button" className="text-[#a8b8d4] transition hover:text-[#d2ddf2]">
                ENG
              </button>
            </div>
            <BrandMark />
          </div>
        </div>
      </header>

      <div className="relative isolate flex-1 overflow-hidden">
        <DotGrid className="right-14 top-10 hidden opacity-60 lg:block" />
        <DotGrid className="left-12 top-[520px] hidden opacity-45 lg:block" />
        <DotGrid className="right-20 bottom-40 hidden opacity-50 md:block" />
        <AccentDot tone="blue" className="-left-16 top-36 h-52 w-52 opacity-70" />
        <AccentDot tone="blue" className="right-[11%] top-[460px] h-24 w-24 opacity-70" />
        <AccentDot tone="blue" className="-right-16 bottom-48 h-48 w-48 opacity-60" />
        <AccentDot tone="orange" className="right-[8%] top-44 h-9 w-9" />
        <AccentDot tone="orange" className="left-[15%] top-[780px] h-7 w-7" />
        <AccentDot tone="orange" className="right-[18%] bottom-24 h-8 w-8" />
        <AccentDot tone="red" className="left-[20%] top-28 h-5 w-5 opacity-90" />
        <AccentDot tone="red" className="right-[7%] top-[720px] h-11 w-11 opacity-90" />
        <AccentDot tone="red" className="left-[8%] bottom-72 h-9 w-9 opacity-85" />

        <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-10 md:px-12">
          <div className="overflow-hidden rounded-[8px] border border-[#d0d0d2] bg-white shadow-[0_18px_60px_rgba(17,17,17,0.08)]">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#d0d0d2] bg-[#e7e7e9] px-6 py-4 md:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">Командний турнір</p>
              <p className="hidden text-sm font-medium text-[#555557] sm:block">{tournament.shortTitle}</p>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.6fr_0.9fr]">
              <div className="space-y-6 p-6 md:p-10">
                <h1 className="text-3xl font-semibold tracking-wide md:text-5xl">{tournament.title}</h1>
                <p className="max-w-[760px] text-base leading-7 text-[#32333a] md:text-lg md:leading-8">
                  {tournament.description}
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {[tournament.goal, tournament.teamRequirement].map((item) => (
                    <div key={item} className="rounded-[8px] border border-[#d5d5d7] bg-[#f8f8f9] p-5">
                      <CheckCircle2 className="mb-3 size-6 text-[#5f72df]" />
                      <p className="text-sm leading-6 text-[#282a31] md:text-base">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="bg-[#d7d7d9] p-6 text-[#111111] md:p-8">
                <div className="flex items-center gap-3">
                  <Info className="size-6 text-[#0b3372]" />
                  <h2 className="text-xl font-semibold md:text-2xl">Головна інформація</h2>
                </div>

                <div className="mt-7 grid gap-3">
                  {stats.map((item) => (
                    <p key={item.label} className="flex items-center justify-between gap-4 border-b border-[#777779] pb-3 text-sm md:text-base">
                      <span>{item.label}</span>
                      <span className="rounded-[6px] bg-white px-3 py-1 font-bold text-[#0a3268]">{item.value}</span>
                    </p>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {tournament.hashtags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#414143]">
                      {tag}
                    </span>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-12 md:px-12">
          <div className="rounded-[8px] border border-[#d0d0d2] bg-white px-5 py-8 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">Timeline</p>
                <h2 className="mt-2 text-2xl font-semibold md:text-4xl">Етапи турніру {tournament.shortTitle}</h2>
              </div>
              <CalendarDays className="size-8 text-[#777779]" />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {tournament.timeline.map((stage, index) => (
                <div key={stage} className="flex items-center gap-4 rounded-[8px] bg-[#d7d7d9] px-4 py-3 text-sm text-[#242424] md:px-5 md:py-4 md:text-lg">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-[#0a3268]">
                    {index + 1}
                  </span>
                  <span>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-12 md:px-12">
          <div className="mx-auto max-w-[1260px] rounded-[8px] border border-[#777779] bg-[#f1f1f2] px-6 py-8 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-10">
            <div className="flex items-center justify-center gap-3 text-center">
              <ClipboardList className="size-7 text-[#5f72df]" />
              <h2 className="text-2xl font-semibold text-[#0b3372] md:text-4xl">Критерії оцінювання</h2>
            </div>

            <div className="mt-7 grid gap-6 text-base leading-7 md:grid-cols-2 md:text-lg">
              <div className="rounded-[8px] bg-white p-5">
                <h3 className="font-semibold">I. Технічна частина</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5">
                  {criteria.technical.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[8px] bg-white p-5">
                <h3 className="font-semibold">II. Функціональність</h3>
                <ul className="mt-4 list-disc space-y-2 pl-5">
                  {criteria.functional.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-14 text-center md:px-12">
          <div className="rounded-[8px] border border-[#d0d0d2] bg-white px-5 py-9 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-10">
            <UsersRound className="mx-auto size-8 text-[#5f72df]" />
            <h2 className="mt-3 text-2xl font-semibold md:text-[34px]">Для реєстрації на командний турнір</h2>
            <ArrowDown className="mx-auto mt-3 size-8 text-[#777779]" />
            <p className="mx-auto mt-6 max-w-[1060px] text-left text-sm leading-6 text-[#34343a] md:text-center md:text-base md:leading-7">
              Капітан команди заповнює дані про всіх учасників. Після цього команда з&apos;явиться на сторінці з усіма турнірами,
              а учасники зможуть підтвердити свою участь.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={`/tournaments/${tournament.id}/join`}
                className="inline-flex min-w-[230px] items-center justify-center rounded-[8px] bg-[#5f72df] px-7 py-2.5 text-base font-medium text-[#0a1f55] shadow-[0_12px_24px_rgba(95,114,223,0.28)] transition hover:bg-[#5366d5] md:text-[20px]"
              >
                Приєднатися до турніру
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-w-[210px] items-center justify-center rounded-[8px] border border-[#5f72df] bg-white px-7 py-2.5 text-base font-medium text-[#0a1f55] transition hover:bg-[#f0f4ff] md:text-[20px]"
              >
                Знайти команду
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
