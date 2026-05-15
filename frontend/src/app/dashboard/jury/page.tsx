"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    GitBranch,
    Loader2,
    Star,
    Video,
} from "lucide-react";
import { criteriaApi, judgeApi, type Criterion, type SubmissionForJudge, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import Footer from "@/components/shared/Footer";

function ScorePanel({
    submission,
    token,
}: {
    submission: SubmissionForJudge;
    token: string;
}) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [score, setScore] = useState<string>(
        submission.evaluation ? String(submission.evaluation.totalScore) : "",
    );
    const [comment, setComment] = useState(submission.evaluation?.comment ?? "");
    const [open, setOpen] = useState(!submission.evaluation);
    const [success, setSuccess] = useState(false);
    const [criterionScores, setCriterionScores] = useState<Record<string, string>>({});

    const { data: allCriteria = [] } = useQuery({
        queryKey: ["criteria", submission.tournamentId],
        queryFn: () => criteriaApi.list(submission.tournamentId, token),
        enabled: Boolean(submission.tournamentId),
    });

    // Per-round filter: criteria bound to this submission's stage, plus tournament-wide ones
    const relevantCriteria: Criterion[] = allCriteria.filter(
        (c) => c.roundId === null || c.roundId === submission.stageId,
    );

    // Scoring leaves: children if a parent has them; otherwise the parent itself.
    const leafCriteria: Criterion[] = relevantCriteria.flatMap((c) => {
        if (c.parentId !== null) return [] as Criterion[];
        const children = relevantCriteria.filter((x) => x.parentId === c.id);
        return children.length > 0 ? children : [c];
    });

    const usePerCriterion = leafCriteria.length > 0;

    const scoreMutation = useMutation({
        mutationFn: async () => {
            if (usePerCriterion) {
                const criteria = leafCriteria.map((c) => {
                    const raw = criterionScores[c.id] ?? "";
                    const v = parseFloat(raw);
                    if (Number.isNaN(v) || v < 0 || v > c.maxScore) {
                        throw new Error(
                            `${c.title}: 0–${c.maxScore}`,
                        );
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
            const s = parseFloat(score);
            if (isNaN(s) || s < 0 || s > 100) throw new Error(t("common.error") + ": 0-100");
            return judgeApi.score(
                {
                    submissionId: submission.id,
                    score: s,
                    comment: comment.trim() || undefined,
                },
                token,
            );
        },
        onSuccess: () => {
            setSuccess(true);
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ["judge-submissions"] });
        },
    });

    return (
        <div className="bg-white border border-[#E0E0E0] rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-6 gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-[13px] font-semibold text-[#1B345B] bg-[#E4EDFA] px-3 py-1 rounded-full">
                            {submission.tournamentTitle}
                        </span>
                        <span className="text-[12px] text-[#888]">{submission.stageName}</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-[#111] mb-1">
                        {submission.teamName}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-[13px] text-[#666] mt-2">
                        {submission.githubUrl && (
                            <a
                                href={submission.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 hover:text-[#1B345B] transition"
                            >
                                <GitBranch size={15} /> GitHub
                            </a>
                        )}
                        {submission.videoUrl && (
                            <a
                                href={submission.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 hover:text-[#1B345B] transition"
                            >
                                <Video size={15} /> {t("jury.video") || "Відео"}
                            </a>
                        )}
                        {submission.liveDemoUrl && (
                            <a
                                href={submission.liveDemoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 hover:text-[#1B345B] transition"
                            >
                                <ExternalLink size={15} /> Demo
                            </a>
                        )}
                    </div>
                    {submission.description && (
                        <p className="mt-3 text-[13px] text-[#555] line-clamp-3 leading-relaxed">
                            {submission.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {submission.evaluation && !open ? (
                        <div className="flex items-center gap-2 bg-[#E8F5E9] px-4 py-2 rounded-lg">
                            <Star size={16} className="text-[#4CAF50]" fill="#4CAF50" />
                            <span className="text-[16px] font-bold text-[#2E7D32]">
                                {submission.evaluation.totalScore}
                            </span>
                            <span className="text-[12px] text-[#4CAF50]">/ 100</span>
                        </div>
                    ) : null}
                    <Link
                        href={`/dashboard/jury/${submission.id}`}
                        className="rounded-md border border-[#5f72df] px-3 py-1.5 text-[12px] font-semibold text-[#5f72df] transition hover:bg-[#eef2ff]"
                    >
                        Деталі →
                    </Link>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="flex items-center gap-1.5 text-[#6082e6] text-[13px] font-medium hover:text-[#4d6bca] transition"
                    >
                        {open ? t("dashboard.jury.hide") : submission.evaluation ? t("dashboard.jury.edit") : t("dashboard.jury.score")}
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${open ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>
            </div>

            {/* Scoring Panel */}
            {open && (
                <div className="border-t border-[#E0E0E0] bg-[#FAFAFA] p-6">
                    {usePerCriterion ? (
                        <div className="space-y-3">
                            <p className="text-[13px] font-semibold text-[#111]">
                                Оцінювання по критеріях
                            </p>
                            <div className="grid gap-3 md:grid-cols-2">
                                {leafCriteria.map((c) => {
                                    const parent = c.parentId
                                        ? relevantCriteria.find((p) => p.id === c.parentId)
                                        : null;
                                    return (
                                        <div
                                            key={c.id}
                                            className="rounded-lg border border-[#D0D0D0] bg-white p-3"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    {parent && (
                                                        <p className="text-[10px] text-[#888] uppercase tracking-wide">
                                                            {parent.title}
                                                        </p>
                                                    )}
                                                    <p className="text-[13px] font-semibold text-[#111]">
                                                        {c.title}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold text-[#3f4b73]">
                                                    max {c.maxScore} · w {c.weight}
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                min={0}
                                                max={c.maxScore}
                                                step={0.5}
                                                value={criterionScores[c.id] ?? ""}
                                                onChange={(e) =>
                                                    setCriterionScores((prev) => ({
                                                        ...prev,
                                                        [c.id]: e.target.value,
                                                    }))
                                                }
                                                placeholder={`0–${c.maxScore}`}
                                                className="mt-2 w-full rounded-md border border-[#D0D0D0] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#6082e6]"
                                            />
                                            {c.description && (
                                                <p className="mt-1 text-[11px] text-[#5b5f69]">
                                                    {c.description}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-[#111] mb-2">
                                    {t("jury.comment")}
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                    placeholder={t("jury.comment_placeholder")}
                                    className="w-full resize-none rounded-lg border border-[#D0D0D0] bg-white px-4 py-2.5 text-[13px] outline-none transition focus:border-[#6082e6]"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-40">
                                <label className="block text-[13px] font-semibold text-[#111] mb-2">
                                    {t("jury.score") || "Оцінка"} (0–100) <span className="text-[#E06C75]">*</span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    placeholder="0–100"
                                    className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#6082e6] transition"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[13px] font-semibold text-[#111] mb-2">
                                    {t("jury.comment")}
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={3}
                                    placeholder={t("jury.comment_placeholder")}
                                    className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-[#6082e6] transition resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {scoreMutation.error && (
                        <p className="text-[#E06C75] text-[13px] mt-2">
                            {(scoreMutation.error as Error).message}
                        </p>
                    )}

                    {success && (
                        <p className="text-[#4CAF50] text-[13px] mt-2 flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> {t("jury.score_saved")}
                        </p>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => scoreMutation.mutate()}
                            disabled={
                                scoreMutation.isPending ||
                                (usePerCriterion
                                    ? leafCriteria.some(
                                          (c) => !(criterionScores[c.id] ?? "").trim(),
                                      )
                                    : !score)
                            }
                            className="flex items-center gap-2 bg-[#6082e6] hover:bg-[#4d6bca] disabled:opacity-50 disabled:cursor-not-allowed transition text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold"
                        >
                            {scoreMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Star size={14} />
                            )}
                            {t("dashboard.jury.save_score")}
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-[#666] hover:text-[#111] px-4 py-2.5 text-[13px] transition"
                        >
                            {t("common.cancel")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function JuryDashboardPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { token, user, hasRole, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && (!user || (!hasRole("JUDGE") && !hasRole("ADMIN")))) {
            router.push("/dashboard");
        }
    }, [authLoading, user, hasRole, router]);

    const { data: submissions, isLoading } = useQuery({
        queryKey: ["judge-submissions"],
        queryFn: () => judgeApi.listSubmissions(token!),
        enabled: Boolean(token) && (hasRole("JUDGE") || hasRole("ADMIN")),
    });

    const reviewed = submissions?.filter((s) => s.evaluation) ?? [];
    const pending = submissions?.filter((s) => !s.evaluation) ?? [];

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
                <Loader2 size={32} className="animate-spin text-[#6082e6]" />
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-[#F4F7FB] font-sans text-[#161616]">
            {/* Header */}
            <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
                >
                    <span className="text-lg leading-none">←</span> {t("dashboard.back")}
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-[24px] font-semibold tracking-wide">FoldUp</span>
                    <img src="/image/orange_icon.png" alt="FoldUp Logo" className="h-8 w-auto" />
                </div>
            </header>

            {/* Main */}
            <div className="mx-auto w-full max-w-[1100px] px-8 py-10 flex-1">
                <div className="mb-8">
                    <h1 className="text-[32px] font-bold text-[#111] mb-2">{t("dashboard.jury.title")}</h1>
                    <p className="text-[14px] text-[#666]">
                        {t("dashboard.jury.subtitle")}
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                        <div className="text-[28px] font-bold text-[#1B345B]">{submissions?.length ?? 0}</div>
                        <div className="text-[13px] text-[#666] mt-1">{t("dashboard.jury.stats.total")}</div>
                    </div>
                    <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                        <div className="text-[28px] font-bold text-[#F4A237]">{pending.length}</div>
                        <div className="text-[13px] text-[#666] mt-1">{t("dashboard.jury.stats.pending")}</div>
                    </div>
                    <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                        <div className="text-[28px] font-bold text-[#4CAF50]">{reviewed.length}</div>
                        <div className="text-[13px] text-[#666] mt-1">{t("dashboard.jury.stats.reviewed")}</div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-[#6082e6]" />
                    </div>
                ) : !submissions || submissions.length === 0 ? (
                    <div className="text-center py-16 text-[#888] text-[14px]">
                        {t("dashboard.jury.none")}
                    </div>
                ) : (
                    <>
                        {/* Pending */}
                        {pending.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-[18px] font-semibold text-[#111] mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#F4A237] inline-block"></span>
                                    {t("dashboard.jury.pending_title")} ({pending.length})
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {pending.map((s) => (
                                        <ScorePanel key={s.id} submission={s} token={token!} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviewed */}
                        {reviewed.length > 0 && (
                            <div>
                                <h2 className="text-[18px] font-semibold text-[#111] mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#4CAF50] inline-block"></span>
                                    {t("dashboard.jury.reviewed_title")} ({reviewed.length})
                                </h2>
                                <div className="flex flex-col gap-4">
                                    {reviewed.map((s) => (
                                        <ScorePanel key={s.id} submission={s} token={token!} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
