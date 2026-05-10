"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Trophy } from "lucide-react";
import { tournamentsApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/shared/Footer";

export default function CreateTournamentPage() {
    const router = useRouter();
    const { token, isAuthenticated, hasRole } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [registrationDeadline, setRegistrationDeadline] = useState("");
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!token) throw new Error("Необхідна авторизація");
            if (!title.trim()) throw new Error("Введіть назву турніру");
            return tournamentsApi.create(
                {
                    title: title.trim(),
                    description: description.trim() || undefined,
                    registrationDeadline: registrationDeadline || undefined,
                    startsAt: startsAt || undefined,
                    endsAt: endsAt || undefined,
                },
                token,
            );
        },
        onSuccess: (tournament) => {
            router.push(`/tournaments/${tournament.id}`);
        },
        onError: (err: Error | ApiError) => {
            setSubmitError(err.message);
        },
    });

    if (!isAuthenticated || (!hasRole("ORGANIZER") && !hasRole("ADMIN"))) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#F4F7FB]">
                <div className="text-center">
                    <p className="text-[#666] mb-4">Доступ лише для організаторів</p>
                    <Link href="/dashboard" className="bg-[#6082e6] text-white px-6 py-3 rounded-lg font-medium">
                        Повернутися
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
                    href="/dashboard/organizer"
                    className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
                >
                    <span className="text-lg leading-none">←</span> Назад
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-[24px] font-semibold tracking-wide">FoldUp</span>
                    <img src="/image/orange_icon.png" alt="FoldUp Logo" className="h-8 w-auto" />
                </div>
            </header>

            {/* Main */}
            <div className="mx-auto w-full max-w-[1200px] px-8 py-10 flex-1">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Form */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        <div>
                            <h1 className="text-[36px] font-bold text-[#111] mb-2 leading-tight">
                                Створення турніру
                            </h1>
                            <p className="text-[14px] text-[#666]">
                                Заповніть інформацію про турнір. Після створення він буде у статусі "Чернетка".
                            </p>
                        </div>

                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Назва турніру <span className="text-[#E06C75]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Наприклад: FoldUp Hackathon 2026"
                                maxLength={200}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1">{title.length}/200</div>
                        </div>

                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Опис
                            </label>
                            <textarea
                                placeholder="Розкажіть учасникам про турнір..."
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                    Кінець реєстрації
                                </label>
                                <input
                                    type="datetime-local"
                                    value={registrationDeadline}
                                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                                    className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                    Дата початку
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startsAt}
                                    onChange={(e) => setStartsAt(e.target.value)}
                                    className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                    Дата завершення
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endsAt}
                                    onChange={(e) => setEndsAt(e.target.value)}
                                    className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                                />
                            </div>
                        </div>

                        {submitError && (
                            <p className="text-[#E06C75] text-[14px] font-medium">{submitError}</p>
                        )}

                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={() => createMutation.mutate()}
                                disabled={createMutation.isPending || !title.trim()}
                                className="bg-[#F4A237] hover:bg-[#e09020] disabled:opacity-50 disabled:cursor-not-allowed transition text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold flex items-center gap-2 shadow-sm"
                            >
                                {createMutation.isPending ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Trophy size={18} />
                                )}
                                Створити турнір
                            </button>
                            <button
                                onClick={() => {
                                    setTitle("");
                                    setDescription("");
                                    setRegistrationDeadline("");
                                    setStartsAt("");
                                    setEndsAt("");
                                    setSubmitError(null);
                                }}
                                disabled={createMutation.isPending}
                                className="bg-white hover:bg-gray-50 transition text-[#111] px-8 py-3.5 rounded-lg text-[15px] font-semibold shadow-sm border border-[#E0E0E0]"
                            >
                                Очистити
                            </button>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="w-full lg:w-[360px] shrink-0 bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#111] mb-5">Поради</h3>
                        <div className="flex flex-col gap-2.5">
                            {[
                                "Після створення турнір отримає статус «Чернетка» — він не буде видимий учасникам",
                                "Натисніть «Опублікувати» у кабінеті організатора, щоб відкрити реєстрацію",
                                "Дати реєстрації, початку та завершення допоможуть учасникам планувати участь",
                                "Ви можете додати раунди та завдання після створення на сторінці турніру",
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
