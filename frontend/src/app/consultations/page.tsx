"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ExternalLink, Loader2, Plus } from "lucide-react";
import { consultationsApi, type Consultation, type ConsultationStatus } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import Footer from "@/components/shared/Footer";

function formatScheduled(dateStr: string | null, language: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return {
        date: d.toLocaleDateString(language === "uk" ? "uk-UA" : "en-US", { day: "numeric", month: "long", year: "numeric" }),
        time: d.toLocaleTimeString(language === "uk" ? "uk-UA" : "en-US", { hour: "2-digit", minute: "2-digit" }),
    };
}

export default function ConsultationsPage() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const { token, isAuthenticated, isLoading: authLoading, hasRole } = useAuth();

    const statusConfig: Record<ConsultationStatus, { label: string; classes: string }> = {
        SCHEDULED: {
            label: t("consultations.status.scheduled"),
            classes: "bg-[#6082e6] text-white border border-[#6082e6]",
        },
        ACTIVE: {
            label: t("consultations.status.active"),
            classes: "bg-[#4CAF50] text-white border border-[#4CAF50]",
        },
        ENDED: {
            label: t("consultations.status.ended"),
            classes: "bg-[#F5F5F5] border border-[#E0E0E0] text-[#666]",
        },
        CANCELLED: {
            label: t("consultations.status.cancelled"),
            classes: "bg-[#F5F5F5] border border-[#E0E0E0] text-[#999]",
        },
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    const { data: consultations, isLoading } = useQuery({
        queryKey: ["consultations"],
        queryFn: () => consultationsApi.list(token!),
        enabled: Boolean(token),
    });

    if (authLoading || !isAuthenticated) {
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

            {/* Main Content Area */}
            <div className="mx-auto w-full max-w-[1000px] px-8 py-12 flex-1">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-2">
                    <h1 className="flex items-center gap-3 text-[32px] font-bold text-[#111] leading-tight">
                        <img src="/image/orange_icon.png" alt="" className="h-7 w-auto" /> {t("consultations.title")}
                    </h1>
                    {(hasRole("ORGANIZER") || hasRole("ADMIN")) && (
                        <Link
                            href="/consultations/newconsul"
                            className="flex items-center gap-2 bg-[#6082e6] hover:bg-[#4d6bca] transition text-white px-5 py-2.5 rounded-lg text-[14px] font-medium shadow-sm"
                        >
                            <Plus size={18} />
                            {t("consultations.create")}
                        </Link>
                    )}
                </div>
                <p className="text-[14px] text-[#888] mb-10">
                    {t("consultations.subtitle")}
                </p>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 size={32} className="animate-spin text-[#6082e6]" />
                    </div>
                ) : !consultations || consultations.length === 0 ? (
                    <div className="text-center py-16 text-[#888] text-[14px]">
                        {t("consultations.none")}{" "}
                        {(hasRole("ORGANIZER") || hasRole("ADMIN")) ? (
                            <Link href="/consultations/newconsul" className="text-[#6082e6] hover:underline">
                                {t("consultations.create_first")}
                            </Link>
                        ) : (
                            <span className="text-[#999]">{t("consultations.organizer_only")}</span>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {consultations.map((item) => {
                            const scheduled = formatScheduled(item.scheduledAt, language);
                            const cfg = statusConfig[item.status] ?? statusConfig.SCHEDULED;
                            return (
                                <Link
                                    key={item.id}
                                    href={`/consultations/${item.id}`}
                                    className="group flex items-center justify-between bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm hover:shadow-md hover:border-[#D0D0D0] transition cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        {/* Status badge */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${cfg.classes}`}>
                                                {cfg.label}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-[18px] font-bold text-[#111] mb-3">
                                            {item.title}
                                        </h3>

                                        {/* Date & Time */}
                                        {scheduled && (
                                            <div className="flex items-center gap-6 text-[13px] text-[#888] font-medium mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={16} className="opacity-80" />
                                                    {scheduled.date}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={16} className="opacity-80" />
                                                    {scheduled.time}
                                                </div>
                                            </div>
                                        )}

                                        {/* Description */}
                                        {item.description && (
                                            <div className="text-[14px] text-[#666] line-clamp-2">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Icon */}
                                    <div className="pr-2 shrink-0">
                                        <ExternalLink
                                            size={28}
                                            className="text-[#B0B0B0] group-hover:text-[#6082e6] transition duration-300"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
