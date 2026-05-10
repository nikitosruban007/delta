"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    MonitorUp,
    Hand,
    Smile,
    PhoneOff,
    MessageSquare,
    Monitor,
} from "lucide-react";
import { useState } from "react";
import { consultationsApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useMutation } from "@tanstack/react-query";

const TILE_COLORS = [
    "#4a7c59",
    "#7b3f3f",
    "#3f5c7b",
    "#7b6f3f",
    "#5c3f7b",
    "#3f7b6a",
    "#7b4f3f",
    "#3f4f7b",
    "#6a7b3f",
];

const PARTICIPANT_NAMES = [
    "Коваров Іван Юрійович",
    "Коваров Іван Юрійович",
    "Коваров Іван Юрійович",
    "Коваров Іван Юрійович",
    "Коваров Іван Юрійович",
    "Коваров Іван Юрійович",
    "Коваров Іван Юрійович",
    "Коваров Іван Юрійович",
    "Коваров Іван Юрійович",
];

type ViewMode = "gallery" | "screen";

export default function MeetingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuth();
    const room = searchParams.get("room") ?? "";
    const consultationId = searchParams.get("id") ?? "";

    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("gallery");

    const leaveMutation = useMutation({
        mutationFn: async () => {
            if (consultationId && token) {
                await consultationsApi.leave(consultationId, token);
            }
        },
        onSettled: () => router.push("/consultations"),
    });

    return (
        <main className="fixed inset-0 flex flex-col bg-[#232734] font-sans z-50">
            {/* Header */}
            <header className="flex h-[56px] items-center justify-between bg-[#1B1F2B] px-6 text-white shrink-0 shadow-md relative z-10 border-b border-white/5">
                <div className="flex flex-col justify-center">
                    <h1 className="text-[15px] font-semibold leading-tight">
                        {room || "React Hooks: Поглиблене вивчення"}
                    </h1>
                    <span className="text-[11px] text-[#A6B6D4]">14:00-15:00</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[18px] font-semibold tracking-wide">FoldUp</span>
                        <img src="/image/orange_icon.png" alt="FoldUp Logo" className="h-6 w-auto" />
                    </div>
                    <button
                        onClick={() => setViewMode(viewMode === "gallery" ? "screen" : "gallery")}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-white/10 hover:bg-white/20 transition-colors border border-white/5 text-[12px] text-white"
                    >
                        <Monitor size={14} />
                        {viewMode === "gallery" ? "Демонстрація" : "Галерея"}
                    </button>
                </div>
            </header>

            {/* Video area */}
            <div className="flex-1 overflow-hidden p-3">
                {viewMode === "gallery" ? (
                    /* Gallery view: 3x3 grid */
                    <div className="h-full grid grid-cols-3 grid-rows-3 gap-2">
                        {PARTICIPANT_NAMES.map((name, i) => (
                            <div
                                key={i}
                                className="relative rounded-lg overflow-hidden flex items-end"
                                style={{ backgroundColor: TILE_COLORS[i % TILE_COLORS.length] }}
                            >
                                {/* Participant avatar */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                                        <span className="text-white text-xl font-bold">
                                            {name[0]}
                                        </span>
                                    </div>
                                </div>
                                {/* Name bar */}
                                <div className="relative z-10 w-full bg-black/30 px-2 py-1">
                                    <p className="text-white text-[10px] truncate">{name}</p>
                                </div>
                                {/* Active speaker indicator */}
                                {i === 4 && (
                                    <div className="absolute inset-0 border-2 border-[#2EED1F] rounded-lg pointer-events-none" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Screen share view: main content + sidebar */
                    <div className="h-full flex gap-2">
                        {/* Main screen share area */}
                        <div className="flex-1 rounded-lg bg-[#1B1F2B] border border-white/10 overflow-hidden flex items-center justify-center">
                            <div className="w-full h-full bg-[#0d1117] flex items-center justify-center rounded-lg">
                                <div className="text-center text-white/40">
                                    <Monitor size={48} className="mx-auto mb-3" />
                                    <p className="text-sm">Демонстрація екрану</p>
                                </div>
                            </div>
                        </div>
                        {/* Right sidebar: participant tiles */}
                        <div className="w-[200px] flex flex-col gap-2 shrink-0">
                            {PARTICIPANT_NAMES.slice(0, 3).map((name, i) => (
                                <div
                                    key={i}
                                    className="flex-1 relative rounded-lg overflow-hidden"
                                    style={{ backgroundColor: TILE_COLORS[i % TILE_COLORS.length] }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                            <span className="text-white text-base font-bold">{name[0]}</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/30 px-2 py-1">
                                        <p className="text-white text-[10px] truncate">{name}</p>
                                    </div>
                                    {i === 1 && (
                                        <div className="absolute inset-0 border-2 border-[#2EED1F] rounded-lg pointer-events-none" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls footer */}
            <footer className="h-[64px] bg-[#1B1F2B] flex items-center justify-between px-6 shrink-0 relative z-10 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMicOn((v) => !v)}
                        className={`w-10 h-9 rounded-md transition-colors flex items-center justify-center ${
                            micOn ? "bg-[#374151] hover:bg-[#4b5563]" : "bg-[#D3201F] hover:bg-[#B51A1A]"
                        }`}
                    >
                        {micOn ? <Mic size={18} className="text-white" /> : <MicOff size={18} className="text-white" />}
                    </button>
                    <button
                        onClick={() => setCamOn((v) => !v)}
                        className={`w-10 h-9 rounded-md transition-colors flex items-center justify-center ${
                            camOn ? "bg-[#374151] hover:bg-[#4b5563]" : "bg-[#D3201F] hover:bg-[#B51A1A]"
                        }`}
                    >
                        {camOn ? <Video size={18} className="text-white" /> : <VideoOff size={18} className="text-white" />}
                    </button>
                    <button className="w-10 h-9 rounded-md bg-[#374151] hover:bg-[#4b5563] transition-colors flex items-center justify-center">
                        <MonitorUp size={18} className="text-white opacity-80" />
                    </button>
                    <button className="w-10 h-9 rounded-md bg-[#374151] hover:bg-[#4b5563] transition-colors flex items-center justify-center">
                        <Hand size={18} className="text-white opacity-80" />
                    </button>
                    <button className="w-10 h-9 rounded-md bg-[#374151] hover:bg-[#4b5563] transition-colors flex items-center justify-center">
                        <Smile size={18} className="text-white opacity-80" />
                    </button>
                </div>

                <button
                    onClick={() => leaveMutation.mutate()}
                    disabled={leaveMutation.isPending}
                    className="px-6 h-9 rounded-md bg-[#D3201F] hover:bg-[#B51A1A] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                    <PhoneOff size={18} className="text-white" />
                    <span className="text-white text-[13px] font-medium">Залишити</span>
                </button>

                <button className="w-10 h-9 rounded-md border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center">
                    <MessageSquare size={18} className="text-white opacity-80" />
                </button>
            </footer>
        </main>
    );
}
