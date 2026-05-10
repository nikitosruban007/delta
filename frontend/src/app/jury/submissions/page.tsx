"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { judgeApi } from "@/lib/api";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function SubmissionsPage() {
    const { token } = useAuth();
    const { t, language, setLanguage } = useLanguage();

    const { data: submissions, isLoading } = useQuery({
        queryKey: ["judge-submissions"],
        queryFn: () => judgeApi.listSubmissions(token!),
        enabled: Boolean(token),
    });

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
                    className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
                >
                    {t("jury.leaderboard")}{" "}
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 1L7 7L1 13" />
                    </svg>
                </Link>
                <Link
                    href="/jury/submissions"
                    className="px-10 py-4 bg-[#D9D9D9] border-r border-black/20 border-b-2 border-b-black text-lg flex items-center gap-2 font-medium cursor-pointer underline underline-offset-4"
                >
                    {t("jury.submissions")}{" "}
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 1L7 7L13 1" />
                    </svg>
                </Link>
            </nav>

            <main className="flex-1 p-12 lg:p-20">
                <h2 className="text-3xl font-medium mb-10">{t("jury.subs.title")}</h2>

                {isLoading && (
                    <div className="flex items-center gap-3 text-gray-500">
                        <Loader2 className="size-6 animate-spin" />
                        {t("common.loading")}
                    </div>
                )}

                {!isLoading && (!submissions || submissions.length === 0) && (
                    <p className="text-gray-500">{t("jury.subs.empty")}</p>
                )}

                {!isLoading && submissions && submissions.length > 0 && (
                    <div className="max-w-lg border border-black inline-block bg-white shadow-sm">
                        {submissions.map((submission, index) => (
                            <Link
                                key={submission.id}
                                href={`/jury/submissions/${submission.id}`}
                                className={`flex items-center justify-between px-8 py-4 text-xl border-black hover:bg-blue-50 cursor-pointer transition-colors ${
                                    index !== submissions.length - 1 ? "border-b" : ""
                                }`}
                            >
                                <span>{submission.teamName}</span>
                                {submission.evaluation && (
                                    <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                                        <CheckCircle2 size={16} />
                                        {submission.evaluation.totalScore}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <footer className="bg-[#D9D9D9] py-10 border-t border-black text-center text-lg mt-auto">
                <p className="mb-4 font-medium text-xl">© 2026 FoldUp</p>
                <div className="text-gray-800 flex justify-center gap-1 text-xl">
                    {t("footer.rights")} [{t("footer.policy")}] | [{t("footer.terms")}] | [{t("footer.contacts")}]
                </div>
            </footer>
        </div>
    );
}
