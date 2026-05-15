"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Loader2,
  Play,
  Save,
  Video,
} from "lucide-react";

import BrandMark from "@/components/shared/BrandMark";
import Footer from "@/components/shared/Footer";
import {
  ApiError,
  criteriaApi,
  judgeApi,
  type Criterion,
} from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

function youtubeEmbed(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    return null;
  } catch {
    return null;
  }
}

export default function JurySubmissionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const submissionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token, hasRole, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !(hasRole("JUDGE") || hasRole("ADMIN"))) {
      router.replace("/dashboard");
    }
  }, [authLoading, hasRole, router]);

  const { data: submission, isLoading } = useQuery({
    queryKey: ["judge-submission", submissionId],
    queryFn: () => judgeApi.getSubmission(submissionId, token!),
    enabled: Boolean(token) && (hasRole("JUDGE") || hasRole("ADMIN")),
  });

  const { data: allCriteria = [] } = useQuery({
    queryKey: ["criteria", submission?.tournamentId],
    queryFn: () => criteriaApi.list(submission!.tournamentId, token),
    enabled: Boolean(submission?.tournamentId),
  });

  const relevantCriteria: Criterion[] = useMemo(
    () =>
      allCriteria.filter(
        (c) => c.roundId === null || c.roundId === submission?.stageId,
      ),
    [allCriteria, submission?.stageId],
  );
  const leafCriteria: Criterion[] = useMemo(() => {
    return relevantCriteria.flatMap((c) => {
      if (c.parentId !== null) return [] as Criterion[];
      const children = relevantCriteria.filter((x) => x.parentId === c.id);
      return children.length > 0 ? children : [c];
    });
  }, [relevantCriteria]);

  const [scores, setScores] = useState<Record<string, string>>({});
  const [flatScore, setFlatScore] = useState("");
  const [comment, setComment] = useState("");

  // Preload existing evaluation
  useEffect(() => {
    if (!submission) return;
    setComment(submission.evaluation?.comment ?? "");
    if (submission.evaluation?.scores?.length) {
      const next: Record<string, string> = {};
      for (const s of submission.evaluation.scores) {
        if (s.criterionId) next[s.criterionId] = String(s.score);
      }
      setScores(next);
    }
    if (
      leafCriteria.length === 0 &&
      typeof submission.evaluation?.totalScore === "number"
    ) {
      setFlatScore(String(submission.evaluation.totalScore));
    }
  }, [submission, leafCriteria.length]);

  const usePerCriterion = leafCriteria.length > 0;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!token || !submission) throw new Error("not ready");
      if (usePerCriterion) {
        const criteria = leafCriteria.map((c) => {
          const raw = scores[c.id] ?? "";
          const v = parseFloat(raw);
          if (Number.isNaN(v) || v < 0 || v > c.maxScore) {
            throw new Error(`${c.title}: 0–${c.maxScore}`);
          }
          return { criterionId: Number(c.id), score: v };
        });
        return judgeApi.score(
          {
            submissionId: submission.id,
            criteria,
            comment: comment.trim() || undefined,
          },
          token,
        );
      }
      const v = parseFloat(flatScore);
      if (Number.isNaN(v) || v < 0 || v > 100) throw new Error("0–100");
      return judgeApi.score(
        {
          submissionId: submission.id,
          score: v,
          comment: comment.trim() || undefined,
        },
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["judge-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["judge-submission", submissionId],
      });
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f6]">
        <Loader2 size={32} className="animate-spin text-[#5f72df]" />
      </div>
    );
  }
  if (!submission) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#666]">
        Подача не знайдена.
      </div>
    );
  }

  const embedUrl = youtubeEmbed(submission.videoUrl);

  // Live total preview
  const liveTotal = (() => {
    if (!usePerCriterion) return parseFloat(flatScore) || 0;
    let sum = 0;
    let weightSum = 0;
    for (const c of leafCriteria) {
      const v = parseFloat(scores[c.id] ?? "");
      if (!Number.isNaN(v)) {
        sum += v * c.weight;
        weightSum += c.weight;
      }
    }
    return weightSum > 0 ? sum / weightSum : 0;
  })();

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#101724]">
      <header className="bg-[#0b3372]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href="/dashboard/jury"
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

      <nav className="border-b border-[#d6d6d9] bg-[#e7e7e9]">
        <div className="mx-auto flex w-full max-w-[1440px] items-stretch px-5 md:px-12">
          <Link
            href={`/tournaments/${submission.tournamentId}`}
            className="border-r border-[#d0d0d2] px-5 py-3 text-sm font-medium text-[#3a4351] transition hover:bg-[#dcdce0]"
          >
            Головна ›
          </Link>
          <Link
            href={`/tournaments/${submission.tournamentId}/leaderboard`}
            className="border-r border-[#d0d0d2] px-5 py-3 text-sm font-medium text-[#3a4351] transition hover:bg-[#dcdce0]"
          >
            Лідерборд ›
          </Link>
          <span className="bg-white px-5 py-3 text-sm font-semibold underline underline-offset-4">
            Список робіт для оцінювання ⌄
          </span>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-[1100px] flex-1 px-5 py-8 md:px-12">
        <div className="mb-1 text-xs text-[#888]">
          {submission.tournamentTitle} · {submission.stageName}
        </div>
        <h1 className="text-3xl font-semibold">{submission.teamName}</h1>

        {/* Scoring table — Figma "Команда 1" */}
        {usePerCriterion ? (
          <div className="mt-6 overflow-x-auto rounded-md border border-[#d0d0d2] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#fafbff] text-left text-xs uppercase tracking-wide text-[#5b5f69]">
                <tr>
                  <th className="border-r border-[#e6e8ef] px-3 py-3 font-semibold"></th>
                  {leafCriteria.map((c) => (
                    <th
                      key={c.id}
                      className="border-r border-[#e6e8ef] px-3 py-3 font-semibold"
                    >
                      {c.title}
                      <span className="ml-1 text-[10px] text-[#888]">
                        / {c.maxScore}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-right font-semibold">
                    Загальна сума балів
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#e6e8ef]">
                  <td className="border-r border-[#e6e8ef] px-3 py-3 font-semibold">
                    {submission.teamName}
                  </td>
                  {leafCriteria.map((c) => (
                    <td
                      key={c.id}
                      className="border-r border-[#e6e8ef] px-2 py-2"
                    >
                      <input
                        type="number"
                        min={0}
                        max={c.maxScore}
                        step={0.5}
                        value={scores[c.id] ?? ""}
                        onChange={(e) =>
                          setScores((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        placeholder={`0–${c.maxScore}`}
                        className="w-full rounded-md border border-[#d0d0d2] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#5f72df]"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right font-mono font-semibold">
                    {liveTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-[#d0d0d2] bg-white p-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#5b5f69]">
              Оцінка (0–100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={flatScore}
              onChange={(e) => setFlatScore(e.target.value)}
              className="mt-1 w-40 rounded-md border border-[#d0d0d2] bg-white px-3 py-2 outline-none focus:border-[#5f72df]"
            />
          </div>
        )}

        {/* Description */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Опис</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#33333f]">
            {submission.description?.trim() || "—"}
          </p>
        </section>

        {/* Video presentation */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Відео презентація</h2>
          {embedUrl ? (
            <div className="mt-3 aspect-video w-full overflow-hidden rounded-md border border-[#d0d0d2] bg-black">
              <iframe
                src={embedUrl}
                title="Video presentation"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : submission.videoUrl ? (
            <a
              href={submission.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#d0d0d2] bg-white px-4 py-2.5 text-sm font-semibold text-[#0a3268] transition hover:bg-[#f0f4ff]"
            >
              <Play className="size-4" />
              Відкрити відео ({new URL(submission.videoUrl).hostname})
            </a>
          ) : (
            <div className="mt-3 flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-[#d0d0d2] bg-[#eaeaec] text-sm text-[#666]">
              <Video className="mr-2 size-5" />
              Відео не додано
            </div>
          )}
        </section>

        {/* GitHub + Live demo */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Посилання на GitHub</h2>
          {submission.githubUrl ? (
            <a
              href={submission.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-sm text-[#1f62df] underline-offset-2 hover:underline"
            >
              <GitBranch className="size-4" />
              {submission.githubUrl}
            </a>
          ) : (
            <p className="mt-2 text-sm text-[#666]">—</p>
          )}
          {submission.liveDemoUrl && (
            <div className="mt-2">
              <a
                href={submission.liveDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#1f62df] underline-offset-2 hover:underline"
              >
                <ExternalLink className="size-4" />
                Live demo: {submission.liveDemoUrl}
              </a>
            </div>
          )}
        </section>

        {/* Comments */}
        <section className="mt-10 rounded-md bg-[#eaeaec] p-6">
          <h2 className="text-lg font-semibold">Коментарі</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Коментар"
            className="mt-3 w-full resize-none rounded-md border border-[#d0d0d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#5f72df]"
          />
        </section>

        {/* Save bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#d0d0d2] bg-white px-4 py-3">
          <div className="text-sm">
            <span className="text-[#5b5f69]">Підсумковий бал: </span>
            <span className="font-mono text-base font-semibold">
              {liveTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {saveMutation.isError && (
              <span className="text-xs text-[#dc2626]">
                {(saveMutation.error as Error)?.message ??
                  "Не вдалося зберегти"}
              </span>
            )}
            {saveMutation.isSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-[#16a34a]">
                <CheckCircle2 className="size-3.5" /> Збережено
              </span>
            )}
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-[#5f72df] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d63cd] disabled:opacity-60"
            >
              {saveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Зберегти оцінку
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
