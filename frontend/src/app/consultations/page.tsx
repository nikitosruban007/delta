"use client";

import Link from "next/link";
import { Calendar, Clock, ExternalLink } from "lucide-react";

type ConsultationStatus = "completed" | "live" | "planned";

interface Consultation {
    id: number;
    status: ConsultationStatus;
    tournament: string;
    title: string;
    date: string;
    time: string;
    mentor: string;
}

const consultations: Consultation[] = [
    {
        id: 1,
        status: "completed",
        tournament: "Code Tournament 2026",
        title: "React Hooks: Поглиблене вивчення",
        date: "7 квітня 2026",
        time: "14:00-15:00",
        mentor: "Комаров Іван Юрійович",
    },
    {
        id: 2,
        status: "completed",
        tournament: "Code Tournament 2026",
        title: "React Hooks: Поглиблене вивчення",
        date: "25 квітня 2026",
        time: "14:00-15:00",
        mentor: "Комаров Іван Юрійович",
    },
    {
        id: 3,
        status: "completed",
        tournament: "Code Tournament 2026",
        title: "React Hooks: Поглиблене вивчення",
        date: "31 квітня 2026",
        time: "14:00-15:00",
        mentor: "Комаров Іван Юрійович",
    },
    {
        id: 4,
        status: "live",
        tournament: "Code Tournament 2026",
        title: "React Hooks: Поглиблене вивчення",
        date: "6 травня 2026",
        time: "14:00-15:00",
        mentor: "Комаров Іван Юрійович",
    },
    {
        id: 5,
        status: "planned",
        tournament: "Code Tournament 2026",
        title: "React Hooks: Поглиблене вивчення",
        date: "12 травня 2026",
        time: "14:00-15:00",
        mentor: "Комаров Іван Юрійович",
    },
    {
        id: 6,
        status: "planned",
        tournament: "Code Tournament 2026",
        title: "React Hooks: Поглиблене вивчення",
        date: "26 травня 2026",
        time: "14:00-15:00",
        mentor: "Комаров Іван Юрійович",
    },
    {
        id: 7,
        status: "planned",
        tournament: "Code Tournament 2026",
        title: "React Hooks: Поглиблене вивчення",
        date: "2 червня 2026",
        time: "14:00-15:00",
        mentor: "Комаров Іван Юрійович",
    },
];

const statusConfig: Record<ConsultationStatus, { label: string; classes: string }> = {
    completed: {
        label: "Завершено",
        classes: "bg-[#F5F5F5] border border-[#E0E0E0] text-[#666]",
    },
    live: {
        label: "Йде зараз",
        classes: "bg-[#4CAF50] text-white border border-[#4CAF50]",
    },
    planned: {
        label: "Заплановано",
        classes: "bg-[#6082e6] text-white border border-[#6082e6]",
    },
};

export default function ConsultationsPage() {
    return (
        <main className="min-h-screen flex flex-col bg-[#F4F7FB] font-sans text-[#161616]">
            {/* Header */}
            <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
                <Link
                    href="/dashboard"
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
            <div className="mx-auto w-full max-w-[1000px] px-8 py-12 flex-1">

                {/* Page Titles */}
                <h1 className="flex items-center gap-3 text-[32px] font-bold text-[#111] mb-2 leading-tight">
                    <img src="/image/orange_icon.png" alt="" className="h-7 w-auto" /> Консультації
                </h1>
                <p className="text-[14px] text-[#888] mb-10">
                    Тут ти можеш приєднуватись до запланованих консультацій в рамках Ваших турнірів
                </p>

                {/* Consultations List */}
                <div className="flex flex-col gap-4">
                    {consultations.map((item) => (
                        <Link
                            key={item.id}
                            href="/consultations/consul"
                            className="group flex items-center justify-between bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm hover:shadow-md hover:border-[#D0D0D0] transition cursor-pointer"
                        >
                            <div className="flex flex-col">
                                {/* Badges */}
                                <div className="flex items-center gap-2 mb-3">
                  <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${statusConfig[item.status].classes}`}
                  >
                    {statusConfig[item.status].label}
                  </span>
                                    <span className="px-3 py-1 rounded-full bg-[#F5F5F5] border border-[#E0E0E0] text-[#666] text-[11px] font-semibold tracking-wide">
                    {item.tournament}
                  </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-[18px] font-bold text-[#111] mb-3">
                                    {item.title}
                                </h3>

                                {/* Date & Time */}
                                <div className="flex items-center gap-6 text-[13px] text-[#888] font-medium mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={16} className="opacity-80" />
                                        {item.date}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={16} className="opacity-80" />
                                        {item.time}
                                    </div>
                                </div>

                                {/* Mentor */}
                                <div className="text-[14px] text-[#111]">
                                    <span className="font-semibold">Ментор:</span> {item.mentor}
                                </div>
                            </div>

                            {/* Action Icon */}
                            <div className="pr-2">
                                <ExternalLink size={28} className="text-[#B0B0B0] group-hover:text-[#6082e6] transition duration-300" strokeWidth={1.5} />
                            </div>
                        </Link>
                    ))}
                </div>

            </div>

            {/* Footer */}
            <footer className="w-full bg-[#EAEAEA] py-6 text-center text-[12px] font-medium text-[#666] mt-auto border-t border-[#E0E0E0]">
                <p>© 2026 FoldUp. Усі права захищено.</p>
                <p className="mt-1">[Політика конфіденційності] | [Умови використання] | [Контакти]</p>
            </footer>
        </main>
    );
}