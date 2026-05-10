"use client";

import Link from "next/link";
import { Inter } from "next/font/google";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { tournamentsApi } from "@/lib/api";
import { useLanguage } from "@/contexts/language-context";
import Footer from "@/components/shared/Footer";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

const ECO_QUEST_TOURNAMENT_ID = 1;

function formatDate(iso: string | null | undefined, language: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(language === "uk" ? "uk-UA" : "en-US", { day: "numeric", month: "long", year: "numeric" });
}

export default function JuryEcoQuestPage() {
    const { t, language, setLanguage } = useLanguage();
    const { data: tournament, isLoading: loadingTournament } = useQuery({
        queryKey: ["tournament", ECO_QUEST_TOURNAMENT_ID],
        queryFn: () => tournamentsApi.getById(ECO_QUEST_TOURNAMENT_ID),
    });

    const { data: rounds, isLoading: loadingRounds } = useQuery({
        queryKey: ["tournament-rounds", ECO_QUEST_TOURNAMENT_ID],
        queryFn: () => tournamentsApi.getRounds(ECO_QUEST_TOURNAMENT_ID),
    });

    const isLoading = loadingTournament || loadingRounds;

    return (
        <div className={`min-h-screen flex flex-col bg-white text-black w-full ${inter.className}`}>
            {/* HEADER */}
            <header className="flex justify-between items-center px-8 py-5 bg-[#1B345B] w-full">
                <Link
                    href="/jury"
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

            {/* TABS NAVIGATION */}
            <nav className="flex bg-[#E5E5E5] border-y border-black/20 w-full mt-10">
                <Link
                    href="/jury/eco-quest"
                    className="px-10 py-4 bg-[#D9D9D9] border-r border-black/20 border-b-2 border-b-black text-lg flex items-center gap-2 font-medium cursor-pointer underline underline-offset-4"
                >
                    {t("jury.main")}
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L13 1" /></svg>
                </Link>
                <Link
                    href="/jury/leaderboard"
                    className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                    {t("jury.leaderboard")}
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
                </Link>
                <Link
                    href="/jury/submissions"
                    className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                    {t("jury.submissions")}
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
                </Link>
            </nav>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="size-10 animate-spin text-gray-400" />
                </div>
            ) : (
                <>
                    {/* HERO SECTION */}
                    <section className="flex flex-col lg:flex-row w-full border-b border-black/20">
                        {/* Left Side */}
                        <div className="flex-1 bg-[#D9D9D9] p-12 lg:p-16">
                            <h1 className="text-4xl lg:text-5xl font-medium tracking-tight mb-10 uppercase">
                                {tournament?.title ?? t("jury.eco.tournament")}
                            </h1>
                            <div className="text-xl leading-relaxed max-w-3xl">
                                {tournament?.description ? (
                                    <p>{tournament.description}</p>
                                ) : (
                                    <p className="text-gray-500 italic">{t("jury.eco.no_desc")}</p>
                                )}
                            </div>
                        </div>

                        {/* Right Side (Stats) */}
                        <div className="w-full lg:w-[450px] bg-[#95BCF0] p-12 lg:p-16 flex flex-col">
                            <h2 className="text-2xl font-medium mb-12">{t("tournament.main_info")}</h2>
                            <div className="space-y-6 text-lg flex-1">
                                <div className="flex justify-between border-b border-black pb-1">
                                    <span>{t("dashboard.tournament.status")}:</span>
                                    <span className="font-medium capitalize">{tournament?.status ?? "—"}</span>
                                </div>
                                <div className="flex justify-between border-b border-black pb-1">
                                    <span>{t("jury.eco.rounds_count")}:</span>
                                    <span className="font-medium">{rounds?.length ?? "—"}</span>
                                </div>
                                <div className="flex justify-between border-b border-black pb-1">
                                    <span>{t("tournament.reg_end")}:</span>
                                    <span className="font-medium">{formatDate(tournament?.registrationDeadline, language)}</span>
                                </div>
                                <div className="flex justify-between border-b border-black pb-1">
                                    <span>{t("tournament.start")}:</span>
                                    <span className="font-medium">{formatDate(tournament?.startsAt, language)}</span>
                                </div>
                                <div className="flex justify-between border-b border-black pb-1">
                                    <span>{t("tournament.end")}:</span>
                                    <span className="font-medium">{formatDate(tournament?.endsAt, language)}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* TIMELINE SECTION */}
                    <section className="py-20 px-8 w-full">
                        <h2 className="text-4xl text-center mb-12">
                            <span className="italic">{t("jury.eco.timeline")}</span>
                        </h2>
                        <div className="max-w-5xl mx-auto space-y-5 text-xl">
                            {tournament?.registrationDeadline && (
                                <div className="bg-[#E5E5E5] px-8 py-4">
                                    {t("jury.eco.reg_end_msg")}{formatDate(tournament.registrationDeadline, language)}
                                </div>
                            )}
                            {tournament?.startsAt && (
                                <div className="bg-[#E5E5E5] px-8 py-4 italic">
                                    {t("jury.eco.start_msg")}{formatDate(tournament.startsAt, language)}
                                </div>
                            )}
                            {rounds && rounds.length > 0 ? (
                                rounds.map((round, i) => (
                                    <div key={round.id} className="bg-[#E5E5E5] px-8 py-4">
                                        {round.title}
                                        {round.deadlineAt && (
                                            <span className="text-gray-600 ml-2">— {t("jury.eco.until")} {formatDate(round.deadlineAt, language)}</span>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="bg-[#E5E5E5] px-8 py-4 text-gray-500 italic">
                                    {t("jury.eco.no_rounds")}
                                </div>
                            )}
                            {tournament?.endsAt && (
                                <div className="bg-[#E5E5E5] px-8 py-4">
                                    {t("jury.eco.end_msg")}{formatDate(tournament.endsAt, language)}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* EVALUATION CRITERIA SECTION */}
                    <section className="pb-24 px-8 w-full">
                        <div className="border border-black p-12 lg:p-16 max-w-5xl mx-auto">
                            <h3 className="text-3xl text-[#EB9626] text-center mb-10 font-medium">
                                {t("jury.evaluation_criteria")}
                            </h3>
                            <div className="space-y-10 text-2xl">
                                <div>
                                    <h4 className="mb-4">{t("jury.technical_part")}</h4>
                                    <ul className="list-disc pl-8 space-y-2">
                                        <li>{t("jury.eco.tech_backend")}</li>
                                        <li>{t("jury.eco.tech_db")}</li>
                                        <li>{t("jury.eco.tech_frontend")}</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="mb-4">{t("jury.functionality")}</h4>
                                    <ul className="list-disc pl-8 space-y-2">
                                        <li>{t("jury.eco.func_req")}</li>
                                        <li>{t("jury.eco.func_bugs")}</li>
                                        <li>{t("jury.eco.func_ux")}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            <Footer />
        </div>
    );
}
