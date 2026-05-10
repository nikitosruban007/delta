"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Send, Trash2, Upload } from "lucide-react";
import { consultationsApi, tournamentsApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/shared/Footer";

type AttachedFile = { name: string; url: string };
type AttachedLink = { value: string };

export default function CreateConsultationPage() {
    const router = useRouter();
    const { token, isAuthenticated } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [tournamentId, setTournamentId] = useState<number | "">("");
    const [additionalComments, setAdditionalComments] = useState("");
    const [links, setLinks] = useState<AttachedLink[]>([{ value: "" }]);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
        queryKey: ["tournaments"],
        queryFn: () => tournamentsApi.list(undefined, token),
        enabled: Boolean(token),
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!token) throw new Error("Необхідна авторизація");
            if (!title.trim()) throw new Error("Вкажіть тему консультації");
            if (!tournamentId) throw new Error("Виберіть турнір");
            return consultationsApi.create(
                {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    scheduledAt: scheduledAt || undefined,
                    tournament_id: Number(tournamentId),
                },
                token,
            );
        },
        onSuccess: (consultation) => {
            router.push(`/consultations/${consultation.id}`);
        },
        onError: (err: Error | ApiError) => {
            setSubmitError(err.message);
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newFiles = files.slice(0, 6 - attachedFiles.length).map((f) => ({
            name: f.name,
            url: URL.createObjectURL(f),
        }));
        setAttachedFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (idx: number) =>
        setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));

    const addLink = () => setLinks((prev) => [...prev, { value: "" }]);
    const updateLink = (idx: number, val: string) =>
        setLinks((prev) => prev.map((l, i) => (i === idx ? { value: val } : l)));
    const removeLink = (idx: number) =>
        setLinks((prev) => prev.filter((_, i) => i !== idx));

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#F4F7FB]">
                <div className="text-center">
                    <p className="text-[#666] mb-4">Для створення консультації необхідно увійти</p>
                    <Link href="/login" className="bg-[#6082e6] text-white px-6 py-3 rounded-lg font-medium">
                        Увійти
                    </Link>
                </div>
            </main>
        );
    }

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
            <div className="mx-auto w-full max-w-[1200px] px-8 py-10 flex-1">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column - Form */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        <div className="mb-2">
                            <h1 className="text-[36px] font-bold text-[#111] mb-2 leading-tight">
                                Створення консультації
                            </h1>
                            <p className="text-[14px] text-[#666]">
                                Вказуйте інформацію вірно для запобігання незручностей!
                            </p>
                        </div>

                        {/* Title Input */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Тема консультації <span className="text-[#E06C75]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Робота у команді"
                                maxLength={200}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {title.length}/200
                            </div>
                        </div>

                        {/* Tournament Select */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Турнір в рамках якого буде консультація <span className="text-[#E06C75]">*</span>
                            </label>
                            <select
                                value={tournamentId}
                                onChange={(e) => setTournamentId(e.target.value ? Number(e.target.value) : "")}
                                disabled={tournamentsLoading}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm disabled:opacity-50"
                            >
                                <option value="">September 2026</option>
                                {tournaments?.map((tournament) => (
                                    <option key={tournament.id} value={tournament.id}>
                                        {tournament.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Scheduled At */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Опис <span className="text-[#E06C75]">*</span>
                            </label>
                            <textarea
                                placeholder="Опис теми та що буде розглядатись на консультації..."
                                rows={7}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm resize-none"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {description.length} символів
                            </div>
                        </div>

                        {/* Files and links section */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-3">
                                Файли та посилання{" "}
                                <span className="text-[13px] font-normal text-[#888]">(до 6 об'єктів можна ввести)</span>
                            </label>

                            {/* Link inputs */}
                            <div className="flex flex-col gap-2 mb-3">
                                {links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="url"
                                            value={link.value}
                                            onChange={(e) => updateLink(idx, e.target.value)}
                                            placeholder="Посилання..."
                                            className="flex-1 bg-white border border-[#D0D0D0] rounded-lg px-4 py-2.5 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => addLink()}
                                            className="w-10 h-10 flex items-center justify-center bg-[#6082e6] text-white rounded-lg hover:bg-[#4d6bca] transition shrink-0"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        {links.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLink(idx)}
                                                className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] text-[#888] rounded-lg hover:bg-[#EAEAEA] transition shrink-0"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* File upload */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={attachedFiles.length >= 6}
                                className="flex items-center gap-2 text-[14px] text-[#6082e6] hover:text-[#4d6bca] transition mb-3 font-medium disabled:opacity-40"
                            >
                                <Upload size={16} />
                                Вибрати файли
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,.pdf,.pptx,.docx"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {/* File grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => {
                                    const file = attachedFiles[i];
                                    return (
                                        <div
                                            key={i}
                                            className="relative aspect-[4/3] bg-[#E8E8E8] rounded-lg border border-[#D0D0D0] flex items-center justify-center overflow-hidden"
                                        >
                                            {file ? (
                                                <>
                                                    {file.url.startsWith("blob:") ? (
                                                        <img
                                                            src={file.url}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[11px] text-[#555] text-center px-2 truncate">
                                                            {file.name}
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(i)}
                                                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 text-xs"
                                                    >
                                                        ×
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Additional comments */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Додаткові коментарі
                            </label>
                            <textarea
                                placeholder="Lorem ipsum dolor sit amet..."
                                rows={5}
                                value={additionalComments}
                                onChange={(e) => setAdditionalComments(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm resize-none"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {additionalComments.length} символів
                            </div>
                        </div>

                        {submitError && (
                            <p className="text-[#E06C75] text-[14px] font-medium">{submitError}</p>
                        )}

                        {/* Scheduled datetime (hidden label, visible input) */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Дата та час проведення
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={() => createMutation.mutate()}
                                disabled={createMutation.isPending}
                                className="bg-[#6082e6] hover:bg-[#4d6bca] disabled:opacity-50 disabled:cursor-not-allowed transition text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold flex items-center gap-2 shadow-sm active:scale-[0.98]"
                            >
                                {createMutation.isPending ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                                Опублікувати
                            </button>
                            <button
                                onClick={() => {
                                    setTitle("");
                                    setDescription("");
                                    setScheduledAt("");
                                    setAdditionalComments("");
                                    setLinks([{ value: "" }]);
                                    setAttachedFiles([]);
                                    setSubmitError(null);
                                }}
                                disabled={createMutation.isPending}
                                className="bg-white hover:bg-gray-50 transition text-[#111] px-8 py-3.5 rounded-lg text-[15px] font-semibold shadow-sm border border-[#E0E0E0] active:scale-[0.98]"
                            >
                                Очистити
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="w-full lg:w-[380px] shrink-0 bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#111] mb-5">
                            Поради при створенні консультації
                        </h3>
                        <div className="flex flex-col gap-2.5">
                            {[
                                "Чітко вкажіть тему консультації/заняття",
                                "Вкажіть дату та час — учасники побачать їх у своєму розкладі",
                                "Не обширно опишіть що буде відбуватися на консультації/занятті",
                                "Вкажіть які файли чи посилання потрібні учасникам для підготовки до заняття",
                                "Після створення ви отримаєте унікальне посилання на кімнату для підключення учасників",
                                "Щоб почати консультацію натисніть кнопку \"Почати\" на сторінці консультації",
                            ].map((tip, i) => (
                                <div key={i} className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
