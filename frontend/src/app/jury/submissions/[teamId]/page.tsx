"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2 } from "lucide-react";
import { judgeApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function TeamEvaluationPage({
    params,
}: {
    params: Promise<{ teamId: string }>;
}) {
    const { teamId: submissionId } = use(params);
    const { token } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const queryClient = useQueryClient();

    const { data: submissions, isLoading } = useQuery({
        queryKey: ["judge-submissions"],
        queryFn: () => judgeApi.listSubmissions(token!),
        enabled: Boolean(token),
    });

    const submission = submissions?.find((s) => s.id === submissionId);

    const [scores, setScores] = useState({ crit1: "", crit2: "", crit3: "" });
    const [comment, setComment] = useState("");
    const [saved, setSaved] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const existingEval = submission?.evaluation;
    if (existingEval && !initialized && !scores.crit1) {
        const third = Math.floor(existingEval.totalScore / 3);
        const remainder = existingEval.totalScore - third * 2;
        setScores({ crit1: String(third), crit2: String(third), crit3: String(remainder) });
        setComment(existingEval.comment ?? "");
        setInitialized(true);
    }

    const totalScore =
        (Number(scores.crit1) || 0) +
        (Number(scores.crit2) || 0) +
        (Number(scores.crit3) || 0);

    const scoreMutation = useMutation({
        mutationFn: async () => {
            if (!submission) throw new Error(t("jury.eval.not_found"));
            if (totalScore <= 0) throw new Error(t("jury.eval.min_score_err"));
            return judgeApi.score(
                { submissionId: submission.id, score: totalScore, comment: comment.trim() || undefined },
                token!,
            );
        },
        onSuccess: () => {
            setSaved(true);
            queryClient.invalidateQueries({ queryKey: ["judge-submissions"] });
        },
    });

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-white ${inter.className}`}>
                <Loader2 className="size-10 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!submission) {
        return (
            <div className={`min-h-screen flex flex-col bg-white text-black w-full ${inter.className}`}>
                <header className="flex justify-between items-center px-8 py-5 bg-[#1B345B] w-full">
                    <Link href="/jury/submissions" className="bg-[#95BCF0] text-black px-6 py-2 rounded-md flex items-center gap-2 font-medium">
                        <span>←</span> {t("jury.back")}
                    </Link>
                    <span className="text-3xl font-semibold text-white">FoldUp</span>
                </header>
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-xl text-gray-500">{t("jury.eval.not_found")}</p>
                </main>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col bg-white text-black w-full ${inter.className}`}>
            {/* HEADER */}
            <header className="flex justify-between items-center px-8 py-5 bg-[#1B345B] w-full">
                <Link
                    href="/jury/submissions"
                    className="bg-[#95BCF0] text-black px-6 py-2 rounded-md flex items-center gap-2 font-medium hover:bg-[#7ca9e6] transition-all cursor-pointer"
                >
                    <span>←</span> {t("jury.back")}
                </Link>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 text-sm font-medium text-white">
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

                    <div className="flex items-center gap-3 select-none">
                        <span className="text-3xl font-semibold text-white tracking-wide">FoldUp</span>
                        <img src="/image/logo.png" alt="FoldUp Logo" className="h-10 w-auto" />
                    </div>
                </div>
            </header>

            {/* NAVIGATION */}
            <nav className="flex bg-[#E5E5E5] border-y border-black/20 w-full mt-10">
                <Link href="/jury/eco-quest" className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer">
                    {t("jury.main")} <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
                </Link>
                <Link href="/jury/leaderboard" className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer">
                    {t("jury.leaderboard")} <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
                </Link>
                <Link href="/jury/submissions" className="px-10 py-4 bg-[#D9D9D9] border-r border-black/20 border-b-2 border-b-black text-lg flex items-center gap-2 font-medium cursor-pointer underline underline-offset-4">
                    {t("jury.submissions")} <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L13 1" /></svg>
                </Link>
            </nav>

            <main className="flex-1 p-12 lg:p-20 space-y-16">
                {/* Title */}
                <div>
                    <p className="text-sm text-gray-500 mb-1">{submission.tournamentTitle} · {submission.stageName}</p>
                    <h2 className="text-4xl font-medium uppercase">{submission.teamName}</h2>
                </div>

                {/* Evaluation Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-black">
                        <thead>
                            <tr>
                                <th className="border border-black w-44 h-12"></th>
                                <th className="border border-black p-3 text-left font-medium">{t("jury.eval.crit1")}</th>
                                <th className="border border-black p-3 text-left font-medium">{t("jury.eval.crit2")}</th>
                                <th className="border border-black p-3 text-left font-medium">{t("jury.eval.crit3")}</th>
                                <th className="border border-black p-3 text-left font-bold">{t("jury.eval.total")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black p-4 font-medium bg-gray-50">{submission.teamName}</td>
                                <td className="border border-black p-0">
                                    <input type="number" min={0} max={100} value={scores.crit1}
                                        onChange={(e) => setScores({ ...scores, crit1: e.target.value })}
                                        className="w-full h-full p-4 focus:bg-blue-50 outline-none text-xl transition-colors" />
                                </td>
                                <td className="border border-black p-0">
                                    <input type="number" min={0} max={100} value={scores.crit2}
                                        onChange={(e) => setScores({ ...scores, crit2: e.target.value })}
                                        className="w-full h-full p-4 focus:bg-blue-50 outline-none text-xl transition-colors" />
                                </td>
                                <td className="border border-black p-0">
                                    <input type="number" min={0} max={100} value={scores.crit3}
                                        onChange={(e) => setScores({ ...scores, crit3: e.target.value })}
                                        className="w-full h-full p-4 focus:bg-blue-50 outline-none text-xl transition-colors" />
                                </td>
                                <td className="border border-black p-4 text-xl font-bold bg-gray-50">
                                    {totalScore > 0 ? totalScore : ""}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Description */}
                {submission.description && (
                    <section className="space-y-4">
                        <h3 className="text-3xl font-medium">{t("jury.eval.description")}</h3>
                        <p className="text-2xl leading-relaxed">{submission.description}</p>
                    </section>
                )}

                {/* Video */}
                <section className="space-y-6">
                    <h3 className="text-3xl font-medium">{t("jury.eval.video")}</h3>
                    {submission.videoUrl ? (
                        <div className="relative w-full max-w-5xl aspect-video bg-[#D9D9D9] border border-black/10">
                            <iframe
                                src={submission.videoUrl.replace("watch?v=", "embed/")}
                                className="w-full h-full"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="relative w-full max-w-5xl aspect-video bg-[#D9D9D9] flex items-center justify-center border border-black/10">
                            <p className="text-gray-500 text-xl">{t("jury.eval.no_video")}</p>
                        </div>
                    )}
                </section>

                {/* GitHub */}
                {submission.githubUrl && (
                    <section className="space-y-4">
                        <h3 className="text-3xl font-medium">{t("jury.eval.github")}</h3>
                        <a href={submission.githubUrl} target="_blank" rel="noreferrer"
                            className="text-2xl text-blue-600 italic hover:underline block break-all">
                            {submission.githubUrl}
                        </a>
                    </section>
                )}

                {/* Live Demo */}
                {submission.liveDemoUrl && (
                    <section className="space-y-4">
                        <h3 className="text-3xl font-medium">{t("jury.eval.live_demo")}</h3>
                        <a href={submission.liveDemoUrl} target="_blank" rel="noreferrer"
                            className="text-2xl text-blue-600 italic hover:underline block break-all">
                            {submission.liveDemoUrl}
                        </a>
                    </section>
                )}

                {/* Comments */}
                <section className="space-y-6">
                    <h3 className="text-4xl font-medium">{t("jury.eval.comments")}</h3>
                    <div className="w-full bg-[#F5F5F5] border border-black/5 focus-within:border-[#EB9626]/30 transition-colors">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t("jury.comment_placeholder")}
                            className="w-full p-10 min-h-[150px] text-2xl bg-transparent outline-none resize-none placeholder:text-gray-500"
                        />
                    </div>
                </section>

                {/* Submit */}
                <section className="space-y-4">
                    {scoreMutation.error && (
                        <p className="text-red-600 text-lg">{(scoreMutation.error as Error).message}</p>
                    )}
                    {saved && (
                        <p className="text-green-600 text-lg flex items-center gap-2">
                            <CheckCircle2 size={20} /> {t("jury.score_saved")}
                        </p>
                    )}
                    <button
                        onClick={() => scoreMutation.mutate()}
                        disabled={scoreMutation.isPending || totalScore <= 0}
                        className="flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-white px-10 py-4 rounded-lg text-xl font-semibold"
                    >
                        {scoreMutation.isPending && <Loader2 size={20} className="animate-spin" />}
                        {existingEval ? t("jury.update_score") : t("jury.save_score")}
                    </button>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="bg-[#E5E5E5] py-12 border-t border-black text-center mt-auto">
                <p className="mb-4 font-medium text-2xl">© 2026 FoldUp</p>
                <div className="text-gray-700 flex justify-center gap-1 text-xl">
                    {t("footer.rights")} [{t("footer.policy")}] | [{t("footer.terms")}] | [{t("footer.contacts")}]
                </div>
            </footer>
        </div>
    );
}
