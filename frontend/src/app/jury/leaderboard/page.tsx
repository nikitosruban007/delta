"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { judgeApi } from "@/lib/api";
import Footer from "@/components/shared/Footer";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

const ECO_QUEST_TOURNAMENT_ID = 1;

export default function LeaderboardPage() {
    const { token } = useAuth();
    const { t, language, setLanguage } = useLanguage();

    const { data: submissions, isLoading, error } = useQuery({
        queryKey: ["judge-submissions"],
        queryFn: () => judgeApi.listSubmissions(token!),
        enabled: Boolean(token),
    });

    const evaluated = (submissions ?? []).filter((s) => s.evaluation !== null);

    const sorted = [...evaluated].sort(
        (a, b) => (b.evaluation?.totalScore ?? 0) - (a.evaluation?.totalScore ?? 0),
    );

    const top3 = sorted.slice(0, 3);
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

    return (
        <div className={`min-h-screen flex flex-col bg-white text-black w-full ${inter.className}`}>
            <header className="flex justify-between items-center px-8 py-5 bg-[#1B345B] w-full">
                <Link
                    href="/jury/eco-quest"
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

            <nav className="flex bg-[#E5E5E5] border-y border-black/20 w-full mt-10">
                <Link
                    href="/jury/eco-quest"
                    className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
                >
                    {t("jury.main")}{" "}
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 1L7 7L1 13" />
                    </svg>
                </Link>
                <Link
                    href="/jury/leaderboard"
                    className="px-10 py-4 bg-[#D9D9D9] border-r border-black/20 border-b-2 border-b-black text-lg flex items-center gap-2 font-medium cursor-pointer underline underline-offset-4"
                >
                    {t("jury.leaderboard")}{" "}
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 1L7 7L13 1" />
                    </svg>
                </Link>
                <Link
                    href="/jury/submissions"
                    className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
                >
                    {t("jury.submissions")}{" "}
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 1L7 7L1 13" />
                    </svg>
                </Link>
            </nav>

            <main className="flex-1 px-10 py-16 lg:px-20 overflow-x-auto">
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="size-10 animate-spin text-[#5B73E1]" />
                    </div>
                )}

                {error && (
                    <div className="rounded-lg bg-red-50 px-6 py-4 text-red-600">
                        {t("jury.lb.error")}
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {/* Top-3 Podium */}
                        <div className="flex items-end justify-center gap-6 mb-16 min-h-[200px]">
                            {podiumOrder.length === 0 ? (
                                [1, 2, 3].map((n) => (
                                    <div
                                        key={n}
                                        className="flex flex-col items-center gap-3"
                                    >
                                        <div className="text-gray-400 text-lg font-medium">{n === 2 ? "🥇" : n === 1 ? "🥈" : "🥉"}</div>
                                        <div
                                            className={`w-[200px] bg-[#D9D9D9] rounded-sm flex items-center justify-center text-gray-500 text-2xl font-bold ${
                                                n === 2 ? "h-[160px]" : n === 1 ? "h-[120px]" : "h-[90px]"
                                            }`}
                                        >
                                            {n}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                podiumOrder.map((item, idx) => {
                                    const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                                    const heights = { 1: "h-[160px]", 2: "h-[120px]", 3: "h-[90px]" };
                                    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
                                    return (
                                        <div key={item?.id ?? idx} className="flex flex-col items-center gap-2">
                                            <span className="text-2xl">{medals[rank as keyof typeof medals]}</span>
                                            <span className="text-sm font-medium text-gray-700 max-w-[200px] text-center truncate">
                                                {item?.teamName ?? "—"}
                                            </span>
                                            <div
                                                className={`w-[200px] bg-[#D9D9D9] rounded-sm flex items-end justify-center pb-4 ${heights[rank as keyof typeof heights]}`}
                                            >
                                                <span className="text-3xl font-bold text-gray-600">{rank}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Table */}
                        {sorted.length === 0 ? (
                            <p className="text-center text-lg text-gray-500 py-10">
                                {t("jury.lb.empty")}
                            </p>
                        ) : (
                            <table className="w-full border-collapse border border-black min-w-[700px]">
                                <thead>
                                    <tr className="bg-white">
                                        <th className="border border-black w-12 h-16 bg-gray-50 px-4 text-center font-bold">
                                            #
                                        </th>
                                        <th className="border border-black p-4 text-lg font-medium text-left">
                                            {t("jury.lb.team")}
                                        </th>
                                        <th className="border border-black p-4 text-base font-medium text-center">
                                            {t("jury.eval.crit1")}
                                        </th>
                                        <th className="border border-black p-4 text-base font-medium text-center">
                                            {t("jury.eval.crit2")}
                                        </th>
                                        <th className="border border-black p-4 text-base font-medium text-center">
                                            {t("jury.eval.crit3")}
                                        </th>
                                        <th className="border border-black p-4 text-xl font-bold text-center bg-gray-100">
                                            {t("jury.eval.total")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map((item, index) => {
                                        const total = item.evaluation?.totalScore ?? 0;
                                        const base = Math.floor(total / 3);
                                        const remainder = total - base * 2;
                                        return (
                                            <tr key={item.id} className="h-12 hover:bg-gray-50 transition-colors">
                                                <td className="border border-black px-4 py-3 text-center font-bold text-[#5B73E1]">
                                                    {index + 1}
                                                </td>
                                                <td className="border border-black bg-[#5B73E1] text-white px-6 py-3 text-lg font-medium">
                                                    {item.teamName}
                                                </td>
                                                <td className="border border-black px-4 py-3 text-center font-medium text-lg">
                                                    {base}
                                                </td>
                                                <td className="border border-black px-4 py-3 text-center font-medium text-lg">
                                                    {base}
                                                </td>
                                                <td className="border border-black px-4 py-3 text-center font-medium text-lg">
                                                    {remainder}
                                                </td>
                                                <td className="border border-black bg-white px-4 py-3 text-center font-bold text-xl">
                                                    {total}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
