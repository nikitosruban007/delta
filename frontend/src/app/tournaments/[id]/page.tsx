"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Crown,
  Info,
  Loader2,
  Star,
  UsersRound,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";
import {
  announcementsApi,
  criteriaApi,
  tournamentsApi,
} from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

export default function TournamentDetailsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { token, user, hasRole } = useAuth();
  const params = useParams();
  const id = params.id as string;

  const {
    data: tournament,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => tournamentsApi.getById(id, token),
    retry: false,
  });

  const { data: rounds } = useQuery({
    queryKey: ["tournament-rounds", id],
    queryFn: () => tournamentsApi.getRounds(id, token),
    enabled: Boolean(tournament),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["tournament-teams", id],
    queryFn: () => tournamentsApi.getTeams(id, token),
    enabled: Boolean(tournament),
  });

  const { data: criteria = [] } = useQuery({
    queryKey: ["criteria", id],
    queryFn: () => criteriaApi.list(id, token),
    enabled: Boolean(tournament),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements", id],
    queryFn: () => announcementsApi.list(id, token),
    enabled: Boolean(tournament),
  });

  const { data: teamLeaderboard } = useQuery({
    queryKey: ["tournament-leaderboard-teams", id],
    queryFn: () => tournamentsApi.getTeamLeaderboard(id, token),
    enabled: Boolean(tournament && tournament.status === "finished"),
  });

  const myCaptainTeam = teams.find((tm) => tm.captainId === user?.id);
  const myMemberTeam = teams.find(
    (tm) =>
      // Team membership is exposed indirectly through captainId; for "member" status
      // the FE relies on `usersApi.myTournaments` (the dedicated page).
      // Here we only surface captain ownership reliably.
      tm.captainId === user?.id,
  );
  const myTeam = myCaptainTeam ?? myMemberTeam ?? null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f6]">
        <Loader2 className="size-10 animate-spin text-[#5f72df]" />
      </div>
    );
  }

  if (error || !tournament) {
    notFound();
  }

  const STATUS_LABELS: Record<string, string> = {
    draft: t("tournament.status.draft"),
    registration: t("tournament.status.registration"),
    active: t("tournament.status.active"),
    finished: t("tournament.status.finished"),
  };

  const STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    registration: "bg-green-100 text-green-700",
    active: "bg-blue-100 text-blue-700",
    finished: "bg-purple-100 text-purple-700",
  };

  const canRegister = tournament.status === "registration";
  // Organizers (and ADMIN) can add a team manually even after registration closes,
  // as long as the tournament is not yet finished.
  const isOwner = user?.id === tournament.organizerId;
  const isAdmin = hasRole("ADMIN");
  const organizerCanAdd =
    (isOwner || isAdmin) && tournament.status !== "finished";
  const locale = language === "uk" ? "uk-UA" : "en-US";

  const formattedDeadline = tournament.registrationDeadline
    ? new Date(tournament.registrationDeadline).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const formattedStart = tournament.startsAt
    ? new Date(tournament.startsAt).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const formattedEnd = tournament.endsAt
    ? new Date(tournament.endsAt).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#101724]">
      <header className="bg-[#0b3372] shadow-[0_10px_30px_rgba(11,51,114,0.18)]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#d8e8ff] px-4 py-2 text-sm font-semibold text-[#0a3268] transition hover:bg-[#e6f0ff]"
          >
            <ArrowLeft className="size-4" />
            {t("tournament.back")}
          </Link>

          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-3 text-sm font-medium">
              <button
                type="button"
                onClick={() => setLanguage("uk")}
                className={language === "uk" ? "underline decoration-1 underline-offset-2" : "text-[#a8b8d4] transition hover:text-[#d2ddf2]"}
              >
                UKR
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={language === "en" ? "underline decoration-1 underline-offset-2" : "text-[#a8b8d4] transition hover:text-[#d2ddf2]"}
              >
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
        <AccentDot tone="blue" className="-left-16 top-36 h-52 w-52 opacity-70" />
        <AccentDot tone="blue" className="right-[11%] top-[460px] h-24 w-24 opacity-70" />
        <AccentDot tone="orange" className="right-[8%] top-44 h-9 w-9" />

        <nav className="border-b border-[#d6d6d9] bg-[#e7e7e9]">
          <div className="mx-auto flex w-full max-w-[1440px] items-stretch px-5 md:px-12">
            <span className="border-r border-[#d0d0d2] bg-white px-5 py-3 text-sm font-semibold underline underline-offset-4">
              Головна ›
            </span>
            <Link
              href={`/tournaments/${tournament.id}/leaderboard`}
              className="border-r border-[#d0d0d2] px-5 py-3 text-sm font-medium text-[#3a4351] transition hover:bg-[#dcdce0]"
            >
              Лідерборд ›
            </Link>
            {(hasRole("JUDGE") || hasRole("ADMIN")) && (
              <Link
                href="/dashboard/jury"
                className="px-5 py-3 text-sm font-medium text-[#3a4351] transition hover:bg-[#dcdce0]"
              >
                Список робіт для оцінювання ›
              </Link>
            )}
          </div>
        </nav>

        <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-10 md:px-12">
          <div className="overflow-hidden rounded-[8px] border border-[#d0d0d2] bg-white shadow-[0_18px_60px_rgba(17,17,17,0.08)]">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#d0d0d2] bg-[#e7e7e9] px-6 py-4 md:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">{t("tournament.team_tournament")}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[tournament.status ?? "draft"]}`}
              >
                {STATUS_LABELS[tournament.status ?? "draft"]}
              </span>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.6fr_0.9fr]">
              <div className="space-y-6 p-6 md:p-10">
                <h1 className="text-3xl font-semibold tracking-wide md:text-5xl">
                  {tournament.title}
                </h1>
                {tournament.description && (
                  <p className="max-w-[760px] text-base leading-7 text-[#32333a] md:text-lg md:leading-8">
                    {tournament.description}
                  </p>
                )}
              </div>

              <aside className="bg-[#d7d7d9] p-6 text-[#111111] md:p-8">
                <div className="flex items-center gap-3">
                  <Info className="size-6 text-[#0b3372]" />
                  <h2 className="text-xl font-semibold md:text-2xl">{t("tournament.main_info")}</h2>
                </div>

                <div className="mt-7 grid gap-3">
                  {formattedDeadline && (
                    <p className="flex items-center justify-between gap-4 border-b border-[#777779] pb-3 text-sm md:text-base">
                      <span>{t("tournament.reg_end")}</span>
                      <span className="rounded-[6px] bg-white px-3 py-1 font-bold text-[#0a3268]">
                        {formattedDeadline}
                      </span>
                    </p>
                  )}
                  {formattedStart && (
                    <p className="flex items-center justify-between gap-4 border-b border-[#777779] pb-3 text-sm md:text-base">
                      <span>{t("tournament.start")}</span>
                      <span className="rounded-[6px] bg-white px-3 py-1 font-bold text-[#0a3268]">
                        {formattedStart}
                      </span>
                    </p>
                  )}
                  {formattedEnd && (
                    <p className="flex items-center justify-between gap-4 border-b border-[#777779] pb-3 text-sm md:text-base">
                      <span>{t("tournament.end")}</span>
                      <span className="rounded-[6px] bg-white px-3 py-1 font-bold text-[#0a3268]">
                        {formattedEnd}
                      </span>
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {rounds && rounds.length > 0 && (
          <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-12 md:px-12">
            <div className="rounded-[8px] border border-[#d0d0d2] bg-white px-5 py-8 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-10">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">{t("tournament.timeline")}</p>
                  <h2 className="mt-2 text-2xl font-semibold md:text-4xl">
                    {t("tournament.rounds")}
                  </h2>
                </div>
                <CalendarDays className="size-8 text-[#777779]" />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {rounds.map((round, index) => (
                  <div
                    key={round.id}
                    className="flex items-start gap-4 rounded-[8px] bg-[#d7d7d9] px-4 py-3 text-sm text-[#242424] md:px-5 md:py-4 md:text-lg"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-[#0a3268]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{round.title}</p>
                      {round.description && (
                        <p className="mt-1 text-sm text-[#555]">{round.description}</p>
                      )}
                      {round.deadlineAt && (
                        <p className="mt-1 text-xs text-[#777]">
                          {t("common.deadline")}: {new Date(round.deadlineAt).toLocaleDateString(locale)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {myTeam && (
          <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-6 md:px-12">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#bbf7d0] bg-[#f0fdf4] px-5 py-4 text-sm text-[#166534] shadow-sm md:px-8">
              <span className="inline-flex items-center gap-2 font-semibold">
                <CheckCircle2 className="size-4" />
                Ви вже зареєстровані: команда «{myTeam.name}»
                {myCaptainTeam && (
                  <span className="ml-2 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[11px] font-semibold text-[#92400e]">
                    <Crown className="mr-1 inline size-3" />
                    Капітан
                  </span>
                )}
              </span>
              {(tournament.status === "active" || tournament.status === "registration") && (
                <Link
                  href={`/tournaments/${id}/submission`}
                  className="rounded-md bg-[#166534] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#125227]"
                >
                  Подати роботу →
                </Link>
              )}
              {tournament.status === "finished" && (
                <span className="rounded-md bg-[#16a34a]/20 px-3 py-1 text-xs font-semibold text-[#166534]">
                  Турнір завершено
                </span>
              )}
            </div>
          </section>
        )}

        {/* Registered teams */}
        <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-8 md:px-12">
          <div className="rounded-[8px] border border-[#d0d0d2] bg-white px-5 py-7 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">
                  Команди
                </p>
                <h2 className="mt-1 text-2xl font-semibold md:text-3xl">
                  Зареєстровані команди ({teams.length})
                </h2>
              </div>
              <UsersRound className="size-8 text-[#777779]" />
            </div>
            {teams.length === 0 ? (
              <p className="mt-5 text-sm text-[#666]">
                Поки що жодної команди не зареєстровано.
              </p>
            ) : (
              <ul className="mt-5 grid gap-2 md:grid-cols-2">
                {teams.map((tm) => (
                  <li
                    key={tm.id}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                      myCaptainTeam?.id === tm.id
                        ? "border-[#16a34a] bg-[#f0fdf4]"
                        : "border-[#e6e8ef] bg-[#fafbff]"
                    }`}
                  >
                    <span className="truncate font-semibold text-[#111]">
                      {tm.name}
                    </span>
                    {tm.captainId === user?.id && (
                      <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#92400e]">
                        Ваша
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Criteria + Announcements side-by-side */}
        <section className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-6 px-5 pb-8 md:grid-cols-2 md:px-12">
          {/* Criteria */}
          <div className="rounded-[8px] border border-[#d0d0d2] bg-white px-5 py-6 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-7">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111]">Критерії оцінювання</h3>
              <ClipboardList className="size-5 text-[#777779]" />
            </div>
            {criteria.length === 0 ? (
              <p className="mt-4 text-sm text-[#666]">
                Критерії ще не визначені.
              </p>
            ) : (
              <ul className="mt-4 space-y-1.5">
                {criteria
                  .filter((c) => c.parentId === null)
                  .map((parent) => {
                    const children = criteria.filter(
                      (c) => c.parentId === parent.id,
                    );
                    return (
                      <li key={parent.id} className="rounded-md bg-[#fafbff] px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#111]">
                            {parent.title}
                          </span>
                          <span className="text-[11px] text-[#888]">
                            max {parent.maxScore} · w {parent.weight}
                          </span>
                        </div>
                        {parent.description && (
                          <p className="mt-1 text-xs text-[#5b5f69]">
                            {parent.description}
                          </p>
                        )}
                        {children.length > 0 && (
                          <ul className="ml-3 mt-1 space-y-0.5">
                            {children.map((c) => (
                              <li
                                key={c.id}
                                className="flex items-center justify-between text-xs text-[#5b5f69]"
                              >
                                <span>→ {c.title}</span>
                                <span className="text-[10px] text-[#888]">
                                  max {c.maxScore} · w {c.weight}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {/* Announcements */}
          <div className="rounded-[8px] border border-[#d0d0d2] bg-white px-5 py-6 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-7">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#111]">Оголошення</h3>
              <Bell className="size-5 text-[#777779]" />
            </div>
            {announcements.length === 0 ? (
              <p className="mt-4 text-sm text-[#666]">Оголошень ще немає.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {announcements.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    className="rounded-md border border-[#eef2ff] bg-[#fafbff] px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-[#111]">{a.title}</p>
                    {a.body && (
                      <p className="mt-1 line-clamp-3 text-xs text-[#5b5f69]">
                        {a.body}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-[#888]">
                      {a.author?.name ?? "—"} ·{" "}
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString(locale)
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Leaderboard (only for finished tournaments) */}
        {tournament.status === "finished" && teamLeaderboard && teamLeaderboard.items.length > 0 && (
          <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-8 md:px-12">
            <div className="rounded-[8px] border border-[#d0d0d2] bg-white px-5 py-7 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">
                    Результати
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold md:text-3xl">
                    Підсумковий лідерборд
                  </h2>
                </div>
                <Award className="size-8 text-[#f4a237]" />
              </div>
              <table className="mt-6 w-full text-sm">
                <thead className="border-b border-[#e6e8ef] text-left text-xs uppercase tracking-wide text-[#5b5f69]">
                  <tr>
                    <th className="py-2 pr-2 font-semibold">Місце</th>
                    <th className="py-2 pr-2 font-semibold">Команда</th>
                    <th className="py-2 pr-2 text-right font-semibold">Бал</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLeaderboard.items.map((row) => (
                    <tr key={row.teamId ?? row.rank} className="border-b border-[#f1f1f1] last:border-b-0">
                      <td className="py-2 pr-2 font-semibold text-[#1B345B]">
                        {row.rank === 1 ? "🏆" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`}
                      </td>
                      <td className="py-2 pr-2">{row.teamName}</td>
                      <td className="py-2 pr-2 text-right font-mono font-semibold">
                        {row.totalScore.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="relative z-10 mx-auto w-full max-w-[1440px] px-5 pb-14 text-center md:px-12">
          <div className="rounded-[8px] border border-[#d0d0d2] bg-white px-5 py-9 shadow-[0_12px_36px_rgba(17,17,17,0.06)] md:px-10">
            <UsersRound className="mx-auto size-8 text-[#5f72df]" />
            <h2 className="mt-3 text-2xl font-semibold md:text-[34px]">
              {t("tournament.reg_prompt")}
            </h2>

            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {canRegister && !myCaptainTeam ? (
                <Link
                  href={`/tournaments/${tournament.id}/join`}
                  className="inline-flex min-w-[230px] items-center justify-center rounded-[8px] bg-[#5f72df] px-7 py-2.5 text-base font-medium text-[#0a1f55] shadow-[0_12px_24px_rgba(95,114,223,0.28)] transition hover:bg-[#5366d5] md:text-[20px]"
                >
                  {t("tournament.join")}
                </Link>
              ) : canRegister && myCaptainTeam ? (
                <span className="inline-flex min-w-[230px] cursor-not-allowed items-center justify-center rounded-[8px] bg-[#d0d0d2] px-7 py-2.5 text-base font-medium text-[#666] md:text-[20px]">
                  Команду вже зареєстровано
                </span>
              ) : organizerCanAdd ? (
                <Link
                  href={`/tournaments/${tournament.id}/join`}
                  title="Реєстрація вже закрита для звичайних учасників, але організатор може додати команду вручну"
                  className="inline-flex min-w-[260px] items-center justify-center rounded-[8px] bg-[#F4A237] px-6 py-2.5 text-base font-medium text-white shadow-[0_12px_24px_rgba(244,162,55,0.28)] transition hover:bg-[#e0901f] md:text-[18px]"
                >
                  Додати команду (організатор)
                </Link>
              ) : (
                <span className="inline-flex min-w-[230px] cursor-not-allowed items-center justify-center rounded-[8px] bg-[#d0d0d2] px-7 py-2.5 text-base font-medium text-[#888] md:text-[20px]">
                    {tournament.status === "finished"
                      ? t("tournament.tournament_finished")
                      : t("tournament.registration_closed")}
                </span>
              )}
              <Link
                href="/dashboard"
                className="inline-flex min-w-[210px] items-center justify-center rounded-[8px] border border-[#5f72df] bg-white px-7 py-2.5 text-base font-medium text-[#0a1f55] transition hover:bg-[#f0f4ff] md:text-[20px]"
              >
                {t("tournament.to_dashboard")}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
