"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Eye, Loader2, Send, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";
import { useAuth } from "@/contexts/auth-context";
import { tournamentsApi, submissionsApi, ApiError } from "@/lib/api";

export default function TournamentSubmissionPage() {
  const params = useParams<{ id: string }>();
  const tournamentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();

  const [activeRound, setActiveRound] = useState(0);
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: tournament, isLoading: tournamentLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => tournamentsApi.getById(tournamentId),
  });

  const { data: rounds, isLoading: roundsLoading } = useQuery({
    queryKey: ["tournament-rounds", tournamentId],
    queryFn: () => tournamentsApi.getRounds(tournamentId),
    enabled: Boolean(tournament),
  });

  const { data: teams } = useQuery({
    queryKey: ["tournament-teams", tournamentId],
    queryFn: () => tournamentsApi.getTeams(tournamentId, token),
    enabled: Boolean(tournament) && Boolean(token),
  });

  const myTeam = teams?.find((t) => t.captainId === user?.id);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      if (!rounds || rounds.length === 0) throw new Error("No rounds found");

      const round = rounds[activeRound];
      if (!round) throw new Error("Round not found");

      if (!myTeam) throw new Error("You are not registered in a team for this tournament");

      return submissionsApi.create(
        {
          roundId: round.id,
          teamId: myTeam.id,
          githubUrl: githubUrl || undefined,
          videoUrl: videoUrl || undefined,
          liveDemoUrl: liveDemoUrl || undefined,
          description: description || undefined,
        },
        token,
      );
    },
    onSuccess: () => {
      setSubmitted(true);
      setMode("view");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError("Сталася помилка. Спробуйте ще раз.");
      }
    },
  });

  if (tournamentLoading || roundsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f6]">
        <Loader2 className="size-10 animate-spin text-[#5f72df]" />
      </div>
    );
  }

  const activeRoundData = rounds?.[activeRound];
  const canEdit = !submitted && isAuthenticated;

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#111111]">
      <header className="bg-[#0b3372] shadow-[0_10px_30px_rgba(11,51,114,0.18)]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#d8e8ff] px-4 py-2 text-sm font-semibold text-[#0a3268] transition hover:bg-[#e6f0ff]"
          >
            <ArrowLeft className="size-4" />
            Повернутися
          </Link>
          <div className="flex items-center gap-6 text-white">
            <BrandMark />
          </div>
        </div>
      </header>

      <section className="relative isolate mx-auto w-full max-w-[1360px] flex-1 px-5 py-10 md:px-10">
        <DotGrid className="right-10 top-8 hidden opacity-60 lg:block" />
        <AccentDot tone="blue" className="-left-12 top-24 h-44 w-44 opacity-70" />
        <AccentDot tone="orange" className="right-12 top-32 h-8 w-8" />

        <div className="relative z-10 mx-auto max-w-[1120px] rounded-[12px] border border-[#d6d6d9] bg-white shadow-[0_18px_70px_rgba(17,17,17,0.10)]">
          <div className="flex flex-col gap-5 border-b border-[#e6e6e8] px-5 py-6 md:flex-row md:items-center md:justify-between md:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f72df]">
                Подача роботи
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                {tournament?.title ?? "Турнір"}
              </h1>
              <p className="mt-2 text-sm text-[#51515a] md:text-base">
                Тут можна подати свою заявку у кілька раундів та відстежити статус від журі.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-[#eef2ff] p-2">
              <button
                type="button"
                onClick={() => canEdit && setMode("edit")}
                disabled={!canEdit}
                className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold transition ${
                  mode === "edit" && canEdit
                    ? "bg-[#5f72df] text-white"
                    : "text-[#3f4b73] hover:bg-white disabled:cursor-not-allowed disabled:text-[#9ea5bd]"
                }`}
              >
                <Edit3 className="size-4" />
                Редагування
              </button>
              <button
                type="button"
                onClick={() => setMode("view")}
                className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold transition ${
                  mode === "view" ? "bg-[#5f72df] text-white" : "text-[#3f4b73] hover:bg-white"
                }`}
              >
                <Eye className="size-4" />
                Перегляд
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 px-5 py-6 md:px-10">
            {!isAuthenticated && (
              <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                Для подачі роботи потрібно{" "}
                <Link href="/login" className="underline font-medium">
                  увійти в акаунт
                </Link>{" "}
                та зареєструвати команду.
              </p>
            )}

            {isAuthenticated && !myTeam && (
              <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                Ви ще не зареєстрували команду на цей турнір.{" "}
                <Link href={`/tournaments/${tournamentId}/join`} className="underline font-medium">
                  Зареєструватися
                </Link>
              </p>
            )}

            {rounds && rounds.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {rounds.map((round, index) => (
                  <button
                    type="button"
                    key={round.id}
                    onClick={() => setActiveRound(index)}
                    className={`flex items-center gap-3 rounded-[10px] px-4 py-3 text-sm font-semibold transition ${
                      activeRound === index
                        ? "bg-[#5f72df] text-white shadow-[0_10px_24px_rgba(79,114,223,0.16)]"
                        : "bg-[#f5f7ff] text-[#0d2e72] hover:bg-[#e7efff]"
                    }`}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#5f72df]">
                      {index + 1}
                    </span>
                    {round.title}
                    {round.deadlineAt && (
                      <span className="ml-auto text-xs opacity-75">
                        до {new Date(round.deadlineAt).toLocaleDateString("uk-UA")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
              <section className="space-y-6 rounded-[16px] border border-[#dce4f0] bg-[#fafbff] p-6 shadow-[0_10px_28px_rgba(15,40,90,0.08)]">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">
                    {activeRoundData?.title ?? "Раунд"}
                  </h2>
                  {submitted && (
                    <span className="rounded-full bg-[#ffe8dc] px-3 py-1 text-sm font-semibold text-[#bf5000]">
                      Статус: Очікується оцінка від журі
                    </span>
                  )}
                </div>

                {serverError && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {serverError}
                  </p>
                )}

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#33333f]">Опис роботи</label>
                    {mode === "edit" && canEdit ? (
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="w-full rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                        placeholder="Короткий опис вашої роботи..."
                      />
                    ) : (
                      <div className="min-h-[160px] rounded-[10px] border border-[#d1d4dd] bg-[#f8f9fb] px-4 py-4 text-base leading-7 text-[#252a32]">
                        {description || "Опис не введено"}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#33333f]">GitHub репозиторій</label>
                      {mode === "edit" && canEdit ? (
                        <input
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/org/repo"
                          className="w-full rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                        />
                      ) : (
                        <div className="rounded-[10px] border border-[#d1d4dd] bg-[#f8f9fb] px-4 py-4 text-base break-words text-[#252a32]">
                          {githubUrl || "—"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#33333f]">Відео презентація</label>
                      {mode === "edit" && canEdit ? (
                        <input
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                        />
                      ) : (
                        <div className="rounded-[10px] border border-[#d1d4dd] bg-[#f8f9fb] px-4 py-4 text-base break-words text-[#252a32]">
                          {videoUrl || "—"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#33333f]">Live Demo URL (опційно)</label>
                    {mode === "edit" && canEdit ? (
                      <input
                        value={liveDemoUrl}
                        onChange={(e) => setLiveDemoUrl(e.target.value)}
                        placeholder="https://myapp.vercel.app"
                        className="w-full rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                      />
                    ) : (
                      <div className="rounded-[10px] border border-[#d1d4dd] bg-[#f8f9fb] px-4 py-4 text-base text-[#252a32]">
                        {liveDemoUrl || "—"}
                      </div>
                    )}
                  </div>
                </div>

                {mode === "edit" && canEdit && (
                  <div className="flex items-center justify-end border-t border-[#e0e2e9] pt-5">
                    <button
                      type="button"
                      onClick={() => submitMutation.mutate()}
                      disabled={submitMutation.isPending}
                      className="inline-flex items-center justify-center gap-3 rounded-[12px] bg-[#4f64db] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(79,100,219,0.26)] transition hover:bg-[#415bcc] disabled:opacity-60"
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Send className="size-5" />
                      )}
                      {submitMutation.isPending ? "Подаємо..." : "Подати роботу"}
                    </button>
                  </div>
                )}
              </section>

              <aside className="space-y-6 rounded-[16px] border border-[#dce4f0] bg-white p-6 shadow-[0_10px_28px_rgba(15,40,90,0.06)]">
                <div className="flex items-center gap-3 text-[#0b3372]">
                  <Video className="size-6" />
                  <div>
                    <p className="text-sm font-semibold">Нагадування</p>
                    <p className="text-sm text-[#5b5f69]">
                      Ця сторінка для подачі підсумкового проекту.
                    </p>
                  </div>
                </div>

                <div className="rounded-[14px] bg-[#f5f7ff] p-5 text-sm leading-6 text-[#323543]">
                  <p className="font-semibold">Як працює подача</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[#4e546d]">
                    <li>Заповніть опис та посилання.</li>
                    <li>Натисніть «Подати роботу».</li>
                    <li>Після подачі ваша робота стане доступна журі.</li>
                  </ul>
                </div>

                <div className="rounded-[14px] border border-[#cfd5ea] bg-[#f8fbff] px-5 py-4 text-sm text-[#38436f]">
                  <p className="font-semibold">Стан</p>
                  <p className="mt-2">
                    {submitted
                      ? "Опубліковано. Очікується оцінка від журі."
                      : "Чернетка. Робота ще не опублікована."}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
