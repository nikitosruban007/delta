"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Calendar,
    Clock,
    ExternalLink,
    FileText,
    Image as ImageIcon,
    Loader2,
    Paperclip,
    Users,
    Video,
} from "lucide-react";
import { consultationsApi, type ConsultationStatus } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/shared/Footer";

const statusConfig: Record<ConsultationStatus, { label: string; classes: string }> = {
    SCHEDULED: { label: "Заплановано", classes: "bg-[#6082e6] text-white" },
    ACTIVE: { label: "Йде зараз", classes: "bg-[#4CAF50] text-white" },
    ENDED: { label: "Завершено", classes: "bg-[#F5F5F5] border border-[#E0E0E0] text-[#666]" },
    CANCELLED: { label: "Скасовано", classes: "bg-[#F5F5F5] border border-[#E0E0E0] text-[#999]" },
};

const DEMO_FILES = [
    { name: "Презентація.pptx", type: "pptx", url: "#" },
    { name: "Скріншот.png", type: "img", url: "#" },
    { name: "Матеріали.pptx", type: "pptx", url: "#" },
];

const DEMO_LINKS = [
    { label: "Посилання на матеріали", url: "#" },
    { label: "Додаткові ресурси", url: "#" },
];

function FileThumb({ name, type }: { name: string; type: string }) {
    return (
        <div className="flex flex-col items-center gap-2 p-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg w-[100px] shrink-0 hover:bg-[#EAEAEA] transition cursor-pointer">
            {type === "img" ? (
                <ImageIcon size={32} className="text-[#6082e6]" />
            ) : (
                <FileText size={32} className="text-[#F4A237]" />
            )}
            <span className="text-[11px] text-[#555] text-center leading-tight truncate w-full">{name}</span>
        </div>
    );
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr: string | null) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}

export default function ConsultationDetailPage() {
    const params = useParams<{ id: string }>();
    const consultationId = params.id;
    const { token, user } = useAuth();
    const queryClient = useQueryClient();

    const { data: consultation, isLoading, error } = useQuery({
        queryKey: ["consultation", consultationId],
        queryFn: () => consultationsApi.getById(consultationId, token!),
        enabled: Boolean(token),
        retry: false,
    });

    const joinMutation = useMutation({
        mutationFn: () => consultationsApi.join(consultationId, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultation", consultationId] });
        },
    });

    const startMutation = useMutation({
        mutationFn: () => consultationsApi.start(consultationId, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultation", consultationId] });
        },
    });

    const endMutation = useMutation({
        mutationFn: () => consultationsApi.end(consultationId, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["consultation", consultationId] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
                <Loader2 size={40} className="animate-spin text-[#6082e6]" />
            </div>
        );
    }

    if (error || !consultation) {
        notFound();
    }

    const cfg = statusConfig[consultation.status] ?? statusConfig.SCHEDULED;
    const isHost = consultation.createdById === user?.id;
    const isActive = consultation.status === "ACTIVE";
    const isScheduled = consultation.status === "SCHEDULED";
    const isEnded = consultation.status === "ENDED";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const roomUrl = consultation.roomId
        ? `${origin}/consultations/meet?room=${consultation.roomId}`
        : null;

    return (
        <main className="min-h-screen flex flex-col bg-[#F4F7FB] font-sans text-[#161616]">
            {/* Header */}
            <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
                <Link
                    href="/consultations"
                    className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
                >
                    <span className="text-lg leading-none">←</span> Повернутися
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-[24px] font-semibold tracking-wide">FoldUp</span>
                    <img src="/image/orange_icon.png" alt="FoldUp Logo" className="h-8 w-auto" />
                </div>
            </header>

            {/* Main Content Area */}
            <div className="mx-auto w-full max-w-[1000px] px-8 py-10 flex-1">
                {/* Breadcrumbs */}
                <div className="mb-6 text-[14px] font-medium text-[#111]">
                    <Link href="/consultations" className="text-[#888] hover:text-[#111] transition">
                        ← Консультації
                    </Link>
                    <span className="text-[#888] mx-2">/</span>
                    {consultation.title}
                </div>

                {/* Consultation Card */}
                <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 md:p-10 shadow-sm">
                    {/* Top Row: Status & Time */}
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className={`px-4 py-1.5 rounded-md text-[13px] font-semibold tracking-wide ${cfg.classes}`}>
                            {cfg.label}
                        </span>
                        {consultation.scheduledAt && (
                            <>
                                <div className="flex items-center gap-2 text-[14px] text-[#666] font-medium">
                                    <Calendar size={16} />
                                    {formatDate(consultation.scheduledAt)}
                                </div>
                                <div className="flex items-center gap-2 text-[14px] text-[#666] font-medium">
                                    <Clock size={16} />
                                    {formatTime(consultation.scheduledAt)}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Title & Actions */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <h1 className="text-[32px] md:text-[36px] font-bold text-[#111] leading-tight">
                            {consultation.title}
                        </h1>

                        <div className="flex flex-wrap gap-3 shrink-0">
                            {isHost && isScheduled && (
                                <button
                                    onClick={() => startMutation.mutate()}
                                    disabled={startMutation.isPending}
                                    className="flex items-center gap-2 bg-[#4CAF50] hover:bg-[#43a047] disabled:opacity-50 transition text-white px-6 py-3 rounded-lg text-[14px] font-semibold shadow-sm"
                                >
                                    {startMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                                    Почати
                                </button>
                            )}
                            {isHost && isActive && (
                                <button
                                    onClick={() => endMutation.mutate()}
                                    disabled={endMutation.isPending}
                                    className="flex items-center gap-2 bg-[#e74c3c] hover:bg-[#c0392b] disabled:opacity-50 transition text-white px-6 py-3 rounded-lg text-[14px] font-semibold shadow-sm"
                                >
                                    {endMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                                    Завершити
                                </button>
                            )}
                            {isActive && consultation.roomId && (
                                <a
                                    href={`/consultations/meet?room=${consultation.roomId}&id=${consultationId}`}
                                    onClick={() => joinMutation.mutate()}
                                    className="flex items-center gap-2 bg-[#6082e6] hover:bg-[#4d6bca] transition text-white px-10 py-3 rounded-lg text-[15px] font-semibold shadow-sm"
                                >
                                    <Video size={16} />
                                    Увійти
                                </a>
                            )}
                            {isActive && !roomUrl && (
                                <button
                                    onClick={() => joinMutation.mutate()}
                                    className="flex items-center gap-2 bg-[#6082e6] hover:bg-[#4d6bca] transition text-white px-10 py-3 rounded-lg text-[15px] font-semibold shadow-sm"
                                >
                                    <Video size={16} />
                                    Приєднатись
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Room link */}
                    {isActive && roomUrl && (
                        <div className="bg-[#F4F7FB] border border-[#E0E0E0] rounded-lg p-4 mb-6 text-[13px]">
                            <span className="font-semibold text-[#111]">Посилання на кімнату: </span>
                            <a
                                href={roomUrl}
                                className="text-[#6082e6] hover:underline break-all"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {roomUrl}
                            </a>
                        </div>
                    )}

                    {/* Mentor info */}
                    <div className="flex items-center gap-2 text-[14px] text-[#555] mb-6">
                        <Users size={16} className="text-[#888]" />
                        <span className="font-medium">Ментор:</span>
                        <span className="text-[#333]">{user?.name ?? "—"}</span>
                    </div>

                    {/* Description */}
                    {consultation.description && (
                        <p className="text-[15px] text-[#444] leading-relaxed mb-8 text-justify">
                            {consultation.description}
                        </p>
                    )}

                    {/* Attached files and links */}
                    <div className="border-t border-[#E0E0E0] pt-6 mb-6">
                        <h3 className="text-[16px] font-bold text-[#111] mb-4 flex items-center gap-2">
                            <Paperclip size={18} className="text-[#888]" />
                            Закріплені файли та посилання
                        </h3>

                        {/* Links */}
                        <div className="flex flex-col gap-2 mb-5">
                            {DEMO_LINKS.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    className="flex items-center gap-2 text-[#6082e6] hover:underline text-[14px]"
                                >
                                    <ExternalLink size={14} />
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* File thumbnails */}
                        <div className="flex flex-wrap gap-3">
                            {DEMO_FILES.map((file, i) => (
                                <FileThumb key={i} name={file.name} type={file.type} />
                            ))}
                        </div>
                    </div>

                    {/* Mentor additional comments */}
                    <div className="border-t border-[#E0E0E0] pt-6">
                        <h3 className="text-[15px] font-bold text-[#111] mb-3">
                            Додаткові коментарі ментора:
                        </h3>
                        <p className="text-[14px] text-[#555] leading-relaxed">
                            {consultation.description
                                ? "Будь ласка, ознайомтесь із матеріалами до початку консультації. Якщо виникнуть питання — задавайте їх під час сесії."
                                : "Коментарі відсутні."}
                        </p>
                    </div>

                    {/* Participants */}
                    {consultation.participants && consultation.participants.length > 0 && (
                        <div className="border-t border-[#E0E0E0] pt-6 mt-6">
                            <h3 className="text-[15px] font-semibold text-[#111] mb-4 flex items-center gap-2">
                                <Users size={18} />
                                Учасники ({consultation.participants.length})
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {consultation.participants.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-2 bg-[#F5F5F5] px-3 py-2 rounded-lg text-[13px]"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-[#E4EDFA] flex items-center justify-center text-[#1B345B] text-[11px] font-bold">
                                            {p.userId[0]?.toUpperCase() ?? "?"}
                                        </div>
                                        <span className="text-[#333]">
                                            {p.userId === user?.id ? "Ви" : `Учасник ${p.userId.slice(0, 6)}`}
                                        </span>
                                        {p.role === "HOST" && (
                                            <span className="text-[#6082e6] text-[11px] font-semibold">(Ведучий)</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ended note */}
                    {isEnded && (
                        <div className="mt-6 bg-[#F5F5F5] rounded-lg p-4 text-[14px] text-[#666] text-center">
                            Консультація завершена
                            {consultation.endedAt && ` — ${formatDate(consultation.endedAt)}`}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
