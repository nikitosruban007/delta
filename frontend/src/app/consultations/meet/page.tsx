"use client";

import Link from "next/link";
import {
    Users,
    Mic,
    Video,
    MonitorUp,
    Hand,
    Smile,
    PhoneOff,
    MessageSquare
} from "lucide-react";

const participants = [
    {
        id: 1,
        name: "Комаров Іван Юрійович",
        role: "Ментор",
        bg: "bg-[#387B16]",
        isSpeaking: true,
        avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
        id: 2,
        name: "Комаров Іван Юрійович",
        bg: "bg-[#74270C]",
        isSpeaking: false,
        avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
        id: 3,
        name: "Комаров Іван Юрійович",
        bg: "bg-[#76550A]",
        isSpeaking: false,
        avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
        id: 4,
        name: "Комаров Іван Юрійович",
        bg: "bg-[#390D6D]",
        isSpeaking: false,
        avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
        id: 5,
        name: "Комаров Іван Юрійович",
        bg: "bg-[#3D0B74]",
        isSpeaking: true,
        avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
        id: 6,
        name: "Комаров Іван Юрійович",
        bg: "bg-gray-800",
        isSpeaking: false,
        isVideoOn: true,
        videoSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=400",
    },
    {
        id: 7,
        name: "Комаров Іван Юрійович",
        bg: "bg-[#0F2661]",
        isSpeaking: false,
        avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
        id: 8,
        name: "Комаров Іван Юрійович",
        bg: "bg-[#115234]",
        isSpeaking: false,
        avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
        id: 9,
        name: "Комаров Іван Юрійович",
        bg: "bg-[#105432]",
        isSpeaking: false,
        avatar: "https://i.pravatar.cc/150?img=11",
    },
];

export default function MeetingPage() {
    return (
        // Використовуємо fixed inset-0 z-50, щоб ігнорувати будь-які обмеження висоти від батьківських Layout
        <main className="fixed inset-0 flex flex-col bg-[#232734] font-sans z-50">
            <header className="flex h-[72px] items-center justify-between bg-[#132B52] px-6 text-white shrink-0 shadow-md relative z-10">
                <div className="flex flex-col justify-center">
                    <h1 className="text-[20px] font-semibold leading-tight mb-0.5">
                        React Hooks: Поглиблене вивчення
                    </h1>
                    <span className="text-[13px] text-[#A6B6D4]">14:00-15:00</span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-[22px] font-semibold tracking-wide">FoldUp</span>
                        <img src="/image/orange_icon.png" alt="FoldUp Logo" className="h-7 w-auto" />
                    </div>
                    <button className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition-colors border border-white/5">
                        <Users size={18} className="text-white" />
                    </button>
                </div>
            </header>

            {/* Зона учасників (додано flex items-center justify-center для вертикального центрування сітки) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar flex items-center justify-center">
                <div className="w-full max-w-[1400px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {participants.map((participant) => (
                        <div
                            key={participant.id}
                            className={`relative flex items-center justify-center w-full aspect-video rounded-lg overflow-hidden ${participant.bg} ${
                                participant.isSpeaking ? "border-[3px] border-[#2EED1F]" : "border-[3px] border-transparent"
                            }`}
                        >
                            {participant.isVideoOn ? (
                                <img
                                    src={participant.videoSrc}
                                    alt={participant.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={participant.avatar}
                                    alt={participant.name}
                                    className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full object-cover shadow-lg"
                                />
                            )}

                            <div className="absolute bottom-3 left-3 text-white text-[13px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                {participant.name}
                            </div>

                            {participant.role && (
                                <div className="absolute bottom-3 right-3 bg-white text-[#111] px-2.5 py-1 rounded-[4px] text-[11px] font-semibold tracking-wide">
                                    {participant.role}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <footer className="h-[76px] bg-[#2B2F3D] flex items-center justify-between px-6 shrink-0 relative z-10 border-t border-white/5">
                <div className="w-[48px] hidden md:block"></div>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <button className="w-12 h-[42px] rounded-md bg-[#474E66] hover:bg-[#5A6380] transition-colors flex items-center justify-center shadow-sm">
                        <Mic size={20} className="text-white opacity-40" />
                    </button>
                    <button className="w-12 h-[42px] rounded-md bg-[#474E66] hover:bg-[#5A6380] transition-colors flex items-center justify-center shadow-sm">
                        <Video size={20} className="text-white opacity-80" />
                    </button>
                    <button className="w-12 h-[42px] rounded-md bg-[#474E66] hover:bg-[#5A6380] transition-colors flex items-center justify-center shadow-sm">
                        <MonitorUp size={20} className="text-white opacity-80" />
                    </button>
                    <button className="w-12 h-[42px] rounded-md bg-[#474E66] hover:bg-[#5A6380] transition-colors flex items-center justify-center shadow-sm">
                        <Hand size={20} className="text-white opacity-80" />
                    </button>
                    <button className="w-12 h-[42px] rounded-md bg-[#474E66] hover:bg-[#5A6380] transition-colors flex items-center justify-center shadow-sm">
                        <Smile size={20} className="text-white opacity-80" />
                    </button>
                    <Link href="/consultations" className="px-8 h-[42px] rounded-md bg-[#D3201F] hover:bg-[#B51A1A] transition-colors flex items-center justify-center shadow-sm ml-2">
                        <PhoneOff size={22} className="text-white" />
                    </Link>
                </div>

                <button className="w-12 h-[42px] rounded-md border border-[#474E66] hover:bg-[#474E66] transition-colors flex items-center justify-center shrink-0">
                    <MessageSquare size={20} className="text-white opacity-80" />
                </button>
            </footer>
        </main>
    );
}