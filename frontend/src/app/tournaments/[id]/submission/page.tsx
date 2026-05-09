"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Send, Video, Eye, Edit3 } from "lucide-react";
import { notFound, useParams } from "next/navigation";

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";
import { getTournamentById, tournaments } from "@/lib/tournaments";

const roundTabs = ["Перший раунд", "Другий раунд", "Третій раунд"];

export default function TournamentSubmissionPage() {
  const params = useParams<{ id: string }>();
  const tournamentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const tournament = getTournamentById(tournamentId);

  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState<"edit" | "view">("edit");
  const [activeRound, setActiveRound] = useState(0);

  const currentTournamentIndex = tournaments.findIndex((item) => item.id === tournamentId);
  const nextTournament = currentTournamentIndex >= 0 ? tournaments[(currentTournamentIndex + 1) % tournaments.length] : null;
  const prevTournament = currentTournamentIndex >= 0 ? tournaments[(currentTournamentIndex - 1 + tournaments.length) % tournaments.length] : null;
  const canEdit = !submitted;

  useEffect(() => {
    if (!tournament) {
      return;
    }

    const savedName = window.sessionStorage.getItem(`${tournament.id}-team-name`);
    if (savedName) {
      setTeamName(savedName);
    } else {
      setTeamName("Назва команди (автоматично)");
    }
  }, [tournament]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    setFiles((prev) => [...prev, ...Array.from(files)]);
    event.target.value = "";
  };

  if (!tournament) {
    notFound();
  }

  const statusLabel = useMemo(() => {
    if (submitted) {
      return "Очікується оцінка від журі";
    }
    return "Чернетка не опублікована";
  }, [submitted]);

  const handleSubmit = () => {
    setSubmitted(true);
    setMode("view");
  };

  const switchTournament = (targetId: string) => {
    window.location.href = `/tournaments/${targetId}/submission`;
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#111111]">
      <header className="bg-[#0b3372] shadow-[0_10px_30px_rgba(11,51,114,0.18)]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href={`/tournaments/${tournament.id}`}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#d8e8ff] px-4 py-2 text-sm font-semibold text-[#0a3268] transition hover:bg-[#e6f0ff]"
          >
            <ArrowLeft className="size-4" />
            Повернутися
          </Link>

          <div className="flex items-center gap-6 text-white">
            <div className="hidden items-center gap-3 text-sm font-medium md:flex">
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

      <section className="relative isolate mx-auto w-full max-w-[1360px] flex-1 px-5 py-10 md:px-10">
        <DotGrid className="right-10 top-8 hidden opacity-60 lg:block" />
        <DotGrid className="bottom-28 left-10 hidden opacity-50 md:block" />
        <AccentDot tone="blue" className="-left-12 top-24 h-44 w-44 opacity-70" />
        <AccentDot tone="blue" className="right-4 bottom-24 h-32 w-32 opacity-65" />
        <AccentDot tone="orange" className="right-12 top-32 h-8 w-8" />
        <AccentDot tone="orange" className="left-[12%] bottom-16 h-7 w-7" />
        <AccentDot tone="red" className="right-[18%] bottom-44 h-10 w-10 opacity-90" />
        <AccentDot tone="red" className="left-[22%] top-20 h-5 w-5 opacity-80" />

        <div className="relative z-10 mx-auto max-w-[1120px] rounded-[12px] border border-[#d6d6d9] bg-white shadow-[0_18px_70px_rgba(17,17,17,0.10)]">
          <div className="flex flex-col gap-5 border-b border-[#e6e6e8] px-5 py-6 md:flex-row md:items-center md:justify-between md:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5f72df]">Подача роботи</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{tournament.title}</h1>
              <p className="mt-2 text-sm text-[#51515a] md:text-base">
                Тут можна подати свою заявку у кілька раундів та відстежити статус від журі.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#4d5778]">
                {prevTournament && (
                  <button
                    type="button"
                    onClick={() => switchTournament(prevTournament.id)}
                    className="rounded-full border border-[#d8e0f3] bg-white px-4 py-2 font-semibold transition hover:border-[#a5b4f0] hover:bg-[#f4f7ff]"
                  >
                    {prevTournament.shortTitle}
                  </button>
                )}
                {nextTournament && (
                  <button
                    type="button"
                    onClick={() => switchTournament(nextTournament.id)}
                    className="rounded-full border border-[#d8e0f3] bg-white px-4 py-2 font-semibold transition hover:border-[#a5b4f0] hover:bg-[#f4f7ff]"
                  >
                    {nextTournament.shortTitle}
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-[#eef2ff] p-2">
              <button
                type="button"
                onClick={() => {
                  if (canEdit) {
                    setMode("edit");
                  }
                }}
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
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
              {roundTabs.map((tab, index) => (
                <button
                  type="button"
                  key={tab}
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
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
              <section className="space-y-6 rounded-[16px] border border-[#dce4f0] bg-[#fafbff] p-6 shadow-[0_10px_28px_rgba(15,40,90,0.08)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">Дані команди</h2>
                    {submitted && (
                      <span className="rounded-full bg-[#ffe8dc] px-3 py-1 text-sm font-semibold text-[#bf5000]">
                        Статус: {statusLabel}
                      </span>
                    )}
                  </div>
                  {!submitted && (
                    <p className="text-sm text-[#575a62]">Перед подачею перевірте опис, відео та GitHub-посилання.</p>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#33333f]">Назва команди <span className="text-[#7b7f8d]">(Автоматично)</span></label>
                    {mode === "edit" && !submitted ? (
                      <input
                        value={teamName}
                        onChange={(event) => setTeamName(event.target.value)}
                        className="w-full rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                        placeholder="Назва вашої команди"
                      />
                    ) : (
                      <div className="rounded-[10px] border border-[#d1d4dd] bg-[#f8f9fb] px-4 py-4 text-base text-[#252a32]">
                        {teamName || "Назва команди буде додана автоматично"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#33333f]">Опис</label>
                    {mode === "edit" && !submitted ? (
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={6}
                        className="w-full rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                        placeholder="Текст з коротким описом роботи. (користувач може писати необмежений текст по кількості символів)"
                      />
                    ) : (
                      <div className="rounded-[10px] border border-[#d1d4dd] bg-[#f8f9fb] px-4 py-4 text-base leading-7 text-[#252a32] min-h-[160px]">
                        {description || "Текст з коротким описом роботи. (користувач може писати необмежений текст по кількості символів)"}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#33333f]">Відео презентація</label>
                      {mode === "edit" && !submitted ? (
                        <input
                          value={videoUrl}
                          onChange={(event) => setVideoUrl(event.target.value)}
                          placeholder="Посилання на відео"
                          className="w-full rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                        />
                      ) : (
                        <div className="relative overflow-hidden rounded-[14px] border border-[#d1d4dd] bg-[#edf0fb] px-4 py-5 text-[#252a32]">
                          <div className="flex min-h-[160px] flex-col items-center justify-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d8def6] text-[#2d3f80]">
                              <Play className="size-6" />
                            </div>
                            <p className="text-sm leading-6 text-[#414151]">
                              {videoUrl || "Посилання на відео презентацію"
                                }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#33333f]">Посилання на GitHub</label>
                      {mode === "edit" && !submitted ? (
                        <input
                          value={githubUrl}
                          onChange={(event) => setGithubUrl(event.target.value)}
                          placeholder="https://github.com/team_name/repository.git"
                          className="w-full rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-3 text-base outline-none transition focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                        />
                      ) : (
                        <div className="rounded-[10px] border border-[#d1d4dd] bg-[#f8f9fb] px-4 py-4 text-base text-[#252a32] min-h-[160px] break-words">
                          {githubUrl || "https://github.com/team_name/repository.git"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[10px] border border-[#c7c9d1] bg-white px-4 py-4 text-sm text-[#323543] shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[#33333f]">Додати файли</p>
                      {mode === "edit" && !submitted ? (
                        <label className="cursor-pointer rounded-full border border-[#d8d9e5] bg-[#f4f6fe] px-3 py-2 text-sm font-semibold text-[#3d4b82] transition hover:bg-[#eef2ff]">
                          Завантажити
                          <input type="file" multiple className="sr-only" onChange={handleFileChange} />
                        </label>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      {files.length > 0 ? (
                        files.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="rounded-[10px] border border-[#e3e7f5] bg-[#f8f9ff] px-3 py-2 text-sm text-[#3f4a6a]">
                            {file.name}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#5f6473]">Наразі файли не додані.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[10px] border border-[#d1d4dd] bg-white px-4 py-4 text-sm leading-6 text-[#4f5362] shadow-sm">
                    <p className="font-semibold text-[#33333f]">Можливі розʼяснення щодо роботи, додаткові фотографії</p>
                    <p className="mt-2 text-[#5f6473]">
                      Додайте необхідні деталі, які допоможуть журі швидко оцінити роботу та технологічні рішення.
                    </p>
                  </div>
                </div>

                {mode === "edit" && !submitted && (
                  <div className="flex flex-col gap-4 border-t border-[#e0e2e9] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-[#51515a]">
                      Mode: <span className="font-semibold text-[#1d2150]">{mode === "edit" ? "Редагування" : "Перегляд"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="inline-flex items-center justify-center gap-3 rounded-[12px] bg-[#4f64db] px-6 py-3 text-base font-semibold text-white shadow-[0_10px_24px_rgba(79,100,219,0.26)] transition hover:bg-[#415bcc]"
                    >
                      <Send className="size-5" />
                      Подати роботу
                    </button>
                  </div>
                )}
              </section>

              <aside className="space-y-6 rounded-[16px] border border-[#dce4f0] bg-white p-6 shadow-[0_10px_28px_rgba(15,40,90,0.06)]">
                <div className="flex items-center gap-3 text-[#0b3372]">
                  <Video className="size-6" />
                  <div>
                    <p className="text-sm font-semibold">Нагадування</p>
                    <p className="text-sm text-[#5b5f69]">Ця сторінка працює для подачі підсумкового проекту.</p>
                  </div>
                </div>

                <div className="rounded-[14px] bg-[#f5f7ff] p-5 text-sm leading-6 text-[#323543]">
                  <p className="font-semibold">Як працює подача</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[#4e546d]">
                    <li>Заповніть опис і посилання.</li>
                    <li>Клікніть «Подати роботу» щоб перейти в режим публікації.</li>
                    <li>Після цього ваша робота стане доступною для оцінювання журі.</li>
                  </ul>
                </div>

                <div className="rounded-[14px] border border-[#cfd5ea] bg-[#f8fbff] px-5 py-4 text-sm text-[#38436f]">
                  <p className="font-semibold">Стан</p>
                  <p className="mt-2">{submitted ? "Опубліковано та очікується оцінка від журі." : "Чернетка. Робота ще не опублікована."}</p>
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
