"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    CheckCircle2,
    Edit3,
    ExternalLink,
    Flag,
    Loader2,
    Megaphone,
    Plus,
    Trophy,
} from "lucide-react";
import { tournamentsApi, tournamentManagementApi, ApiError, type Tournament } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import Footer from "@/components/shared/Footer";

const STATUS_CONFIG: Record<string, { labelKey: string; bg: string; text: string }> = {
    draft: { labelKey: "tournament.status.draft", bg: "bg-[#F3F4F6]", text: "text-[#555]" },
    registration: { labelKey: "tournament.status.registration", bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
    active: { labelKey: "tournament.status.active", bg: "bg-[#DCFCE7]", text: "text-[#166534]" },
    finished: { labelKey: "tournament.status.finished", bg: "bg-[#E0E0E0]", text: "text-[#555]" },
};

function TournamentRow({ tournament, token }: { tournament: Tournament; token: string }) {
    const { t, language } = useLanguage();
    const queryClient = useQueryClient();
    const cfg = STATUS_CONFIG[tournament.status] ?? STATUS_CONFIG.draft;
    const locale = language === "uk" ? "uk-UA" : "en-US";

    const publishMutation = useMutation({
        mutationFn: () => tournamentsApi.publish(tournament.id, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-tournaments"] }),
    });

    const finishMutation = useMutation({
        mutationFn: () => tournamentManagementApi.finish(tournament.id, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-tournaments"] }),
    });

    return (
        <div className="flex items-center justify-between bg-white border border-[#E0E0E0] rounded-xl px-6 py-4 shadow-sm gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className={`text-[12px] font-semibold px-3 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {t(cfg.labelKey)}
                    </span>
                    <h3 className="text-[15px] font-semibold text-[#111] truncate">{tournament.title}</h3>
                </div>
                {tournament.description && (
                    <p className="text-[13px] text-[#666] line-clamp-1">{tournament.description}</p>
                )}
                <div className="flex gap-4 mt-1 text-[12px] text-[#888]">
                    {tournament.startsAt && (
                        <span>{t("tournament.start")}: {new Date(tournament.startsAt).toLocaleDateString(locale)}</span>
                    )}
                    {tournament.endsAt && (
                        <span>{t("tournament.end")}: {new Date(tournament.endsAt).toLocaleDateString(locale)}</span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {tournament.status === "draft" && (
                    <button
                        onClick={() => publishMutation.mutate()}
                        disabled={publishMutation.isPending}
                        className="flex items-center gap-1.5 bg-[#F4A237] hover:bg-[#e09020] disabled:opacity-50 transition text-white px-4 py-2 rounded-lg text-[12px] font-semibold"
                    >
                        {publishMutation.isPending ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={13} />
                        )}
                        {t("dashboard.organizer.publish")}
                    </button>
                )}
                {publishMutation.isSuccess && (
                    <span className="text-[12px] text-[#4CAF50] font-medium">{t("dashboard.organizer.published")}</span>
                )}
                {(tournament.status === "active" || tournament.status === "registration") && (
                    <button
                        onClick={() => {
                            if (window.confirm("Завершити турнір? Це зафіксує лідерборд.")) {
                                finishMutation.mutate();
                            }
                        }}
                        disabled={finishMutation.isPending}
                        className="flex items-center gap-1.5 bg-[#1B345B] hover:bg-[#0f2546] disabled:opacity-50 transition text-white px-3 py-2 rounded-lg text-[12px] font-semibold"
                    >
                        {finishMutation.isPending ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Flag size={13} />
                        )}
                        Завершити
                    </button>
                )}
                {finishMutation.error && (
                    <span className="text-[12px] text-[#E06C75]">
                        {finishMutation.error instanceof ApiError
                            ? finishMutation.error.message
                            : (finishMutation.error as Error).message}
                    </span>
                )}
                <Link
                    href={`/dashboard/organizer/${tournament.id}/edit`}
                    className="flex items-center gap-1.5 text-[#6082e6] hover:text-[#4d6bca] transition text-[12px] font-medium"
                >
                    <Edit3 size={14} /> Редагувати
                </Link>
                <Link
                    href={`/tournaments/${tournament.id}/announcements`}
                    className="flex items-center gap-1.5 text-[#6082e6] hover:text-[#4d6bca] transition text-[12px] font-medium"
                >
                    <Megaphone size={14} /> Оголошення
                </Link>
                <Link
                    href={`/tournaments/${tournament.id}`}
                    className="flex items-center gap-1.5 text-[#6082e6] hover:text-[#4d6bca] transition text-[12px] font-medium"
                >
                    <ExternalLink size={14} /> {t("dashboard.organizer.view")}
                </Link>
            </div>
        </div>
    );
}

export default function OrganizerDashboardPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { token, user, hasRole, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && (!user || (!hasRole("ORGANIZER") && !hasRole("ADMIN")))) {
            router.push("/dashboard");
        }
    }, [authLoading, user, hasRole, router]);

    const { data: allTournaments, isLoading } = useQuery({
        queryKey: ["all-tournaments"],
        queryFn: () => tournamentsApi.list(undefined, token),
        enabled: Boolean(token) && (hasRole("ORGANIZER") || hasRole("ADMIN")),
    });

    const myTournaments = (allTournaments ?? []).filter(
        (t) => t.organizerId === user?.id || hasRole("ADMIN"),
    );

    const draft = myTournaments.filter((t) => t.status === "draft");
    const active = myTournaments.filter((t) => t.status === "active" || t.status === "registration");
    const finished = myTournaments.filter((t) => t.status === "finished");

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
                <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-[32px] font-bold text-[#111] mb-2">{t("dashboard.organizer.title")}</h1>
                        <p className="text-[14px] text-[#666]">{t("dashboard.organizer.subtitle")}</p>
                    </div>
                    <Link
                        href="/dashboard/organizer/new"
                        className="flex items-center gap-2 bg-[#F4A237] hover:bg-[#e09020] transition text-white px-6 py-3 rounded-xl text-[14px] font-semibold shadow-sm"
                    >
                        <Plus size={18} /> {t("dashboard.organizer.create")}
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                        <div className="text-[28px] font-bold text-[#1B345B]">{myTournaments.length}</div>
                        <div className="text-[13px] text-[#666] mt-1">{t("dashboard.organizer.stats.total")}</div>
                    </div>
                    <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                        <div className="text-[28px] font-bold text-[#888]">{draft.length}</div>
                        <div className="text-[13px] text-[#666] mt-1">{t("dashboard.organizer.stats.drafts")}</div>
                    </div>
                    <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                        <div className="text-[28px] font-bold text-[#4CAF50]">{active.length}</div>
                        <div className="text-[13px] text-[#666] mt-1">{t("dashboard.organizer.stats.active")}</div>
                    </div>
                    <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                        <div className="text-[28px] font-bold text-[#636363]">{finished.length}</div>
                        <div className="text-[13px] text-[#666] mt-1">{t("dashboard.organizer.stats.finished")}</div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-[#6082e6]" />
                    </div>
                ) : myTournaments.length === 0 ? (
                    <div className="text-center py-16">
                        <Trophy size={48} className="text-[#E0E0E0] mx-auto mb-4" />
                        <p className="text-[#888] text-[14px] mb-4">{t("dashboard.organizer.none")}</p>
                        <Link
                            href="/dashboard/organizer/new"
                            className="inline-flex items-center gap-2 bg-[#F4A237] hover:bg-[#e09020] transition text-white px-6 py-3 rounded-xl text-[14px] font-semibold"
                        >
                            <Plus size={16} /> {t("dashboard.organizer.create_first")}
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {[...draft, ...active, ...finished].map((t) => (
                            <TournamentRow key={t.id} tournament={t} token={token!} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
