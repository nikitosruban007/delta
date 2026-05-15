"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
    Hand,
    Loader2,
    MessageSquare,
    Mic,
    MicOff,
    MonitorUp,
    PhoneOff,
    Send,
    Smile,
    Users,
    Video,
    VideoOff,
    X,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { consultationsApi } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
// Socket.IO connects to server origin (without `/api`)
const SOCKET_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

/**
 * ICE servers. STUN defaults to Google's public servers; production should
 * configure a TURN relay via NEXT_PUBLIC_TURN_URL (+ optional credentials)
 * for NAT traversal on restricted networks.
 *
 *   NEXT_PUBLIC_STUN_URL     comma-separated STUN URLs (default: Google's)
 *   NEXT_PUBLIC_TURN_URL     comma-separated TURN URLs (e.g. turn:turn.example.com:3478)
 *   NEXT_PUBLIC_TURN_USER    TURN username
 *   NEXT_PUBLIC_TURN_PASS    TURN credential (long-term or REST-derived)
 */
const ICE_SERVERS: RTCIceServer[] = (() => {
    const stunUrls = (
        process.env.NEXT_PUBLIC_STUN_URL ??
        "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302"
    )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const turnUrlsRaw = process.env.NEXT_PUBLIC_TURN_URL?.trim();
    const turnUser = process.env.NEXT_PUBLIC_TURN_USER?.trim();
    const turnPass = process.env.NEXT_PUBLIC_TURN_PASS?.trim();

    const servers: RTCIceServer[] = [];
    if (stunUrls.length > 0) servers.push({ urls: stunUrls });
    if (turnUrlsRaw) {
        const turnUrls = turnUrlsRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        servers.push({
            urls: turnUrls,
            ...(turnUser ? { username: turnUser } : {}),
            ...(turnPass ? { credential: turnPass } : {}),
        });
    }
    return servers;
})();

const REACTIONS = ["👍", "❤️", "🎉", "😂", "👏", "🤔"];

type Presence = {
    micOn: boolean;
    camOn: boolean;
    screenSharing: boolean;
    handRaised: boolean;
    name: string | null;
};

type PeerInfo = {
    socketId: string;
    userId: string;
    presence: Presence;
};

type ChatItem = {
    socketId: string;
    userId: string;
    name: string | null;
    text: string;
    at: number;
};

type FloatingReaction = {
    id: number;
    socketId: string;
    emoji: string;
};

const defaultPresence = (name: string | null): Presence => ({
    micOn: true,
    camOn: true,
    screenSharing: false,
    handRaised: false,
    name,
});

function initialOf(name: string | null | undefined): string {
    if (!name) return "?";
    return name.trim()[0]?.toUpperCase() ?? "?";
}

export default function MeetingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { token, user } = useAuth();
    const consultationId = searchParams.get("id") ?? "";

    const [phase, setPhase] = useState<"idle" | "connecting" | "live" | "ended">(
        "idle",
    );
    const [error, setError] = useState<string | null>(null);

    // Local state
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [screenOn, setScreenOn] = useState(false);
    const [handRaised, setHandRaised] = useState(false);

    // Peer state
    const [peers, setPeers] = useState<Map<string, PeerInfo>>(new Map());
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
        new Map(),
    );

    // UI panels
    const [sidePanel, setSidePanel] = useState<"none" | "participants" | "chat">(
        "none",
    );
    const [chat, setChat] = useState<ChatItem[]>([]);
    const [chatDraft, setChatDraft] = useState("");
    const [reactions, setReactions] = useState<FloatingReaction[]>([]);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    // Refs for transient state we do NOT want to trigger re-renders for
    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const screenTrackRef = useRef<MediaStreamTrack | null>(null);
    const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
    const reactionIdRef = useRef(0);
    const presenceRef = useRef<Presence>(defaultPresence(user?.name ?? null));

    // ─── Local stream attach ─────────────────────────────────────────────────
    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    });

    // ─── Main lifecycle ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!consultationId) {
            setError("Не вказано consultationId (?id=...)");
            return;
        }
        if (!user) return;

        let cancelled = false;
        setPhase("connecting");

        (async () => {
            // 1) Local media
            let local: MediaStream | null = null;
            try {
                local = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                });
            } catch (err) {
                console.error("getUserMedia failed", err);
                if (cancelled) return;
                setError(
                    "Не вдалося отримати доступ до камери/мікрофона. Дозвольте їх у браузері.",
                );
                setPhase("idle");
                return;
            }
            if (cancelled) {
                local.getTracks().forEach((t) => t.stop());
                return;
            }
            localStreamRef.current = local;
            cameraTrackRef.current = local.getVideoTracks()[0] ?? null;
            if (localVideoRef.current) localVideoRef.current.srcObject = local;

            // 2) Backend: persist join
            if (token) {
                try {
                    await consultationsApi.join(consultationId, token);
                } catch (err) {
                    // Non-fatal: room may already record us as participant
                    console.warn("consultationsApi.join failed", err);
                }
            }

            // 3) Socket.IO signaling
            const socket = io(`${SOCKET_ORIGIN}/consultations`, {
                transports: ["websocket"],
                auth: token ? { token } : undefined,
            });
            socketRef.current = socket;

            socket.on("connect", () => {
                socket.emit("join", {
                    consultationId,
                    userId: user.id,
                    name: user.name ?? null,
                });
            });

            socket.on(
                "peers",
                (payload: { peers: PeerInfo[] }) => {
                    if (cancelled) return;
                    const next = new Map<string, PeerInfo>();
                    for (const p of payload.peers) next.set(p.socketId, p);
                    setPeers(next);
                    // We initiate offers to each existing peer.
                    for (const p of payload.peers) {
                        void this_offerTo(p.socketId);
                    }
                    setPhase("live");
                },
            );

            socket.on("peer_joined", (payload: PeerInfo) => {
                if (cancelled) return;
                setPeers((prev) => {
                    const next = new Map(prev);
                    next.set(payload.socketId, payload);
                    return next;
                });
                // We don't initiate — existing peers wait for the new joiner's offer.
            });

            socket.on(
                "peer_left",
                (payload: { socketId: string; userId: string }) => {
                    if (cancelled) return;
                    closePeer(payload.socketId);
                },
            );

            socket.on(
                "peer_presence",
                (payload: { socketId: string; userId: string; presence: Presence }) => {
                    if (cancelled) return;
                    setPeers((prev) => {
                        const next = new Map(prev);
                        const existing = next.get(payload.socketId);
                        if (existing) {
                            next.set(payload.socketId, {
                                ...existing,
                                presence: payload.presence,
                            });
                        }
                        return next;
                    });
                },
            );

            socket.on(
                "signal_exchange",
                async (
                    msg: {
                        consultationId: string;
                        fromUserId: string;
                        fromSocketId?: string;
                        toUserId?: string;
                        toSocketId?: string;
                        payload: any;
                    },
                ) => {
                    if (cancelled) return;
                    if (msg.fromSocketId === socket.id) return;
                    if (msg.toSocketId && msg.toSocketId !== socket.id) return;
                    const peerSocketId = msg.fromSocketId;
                    if (!peerSocketId) return;
                    await handleSignal(peerSocketId, msg.payload);
                },
            );

            socket.on(
                "reaction",
                (payload: {
                    socketId: string;
                    userId: string;
                    emoji: string;
                    at: number;
                }) => {
                    if (cancelled) return;
                    const id = ++reactionIdRef.current;
                    setReactions((prev) => [
                        ...prev,
                        { id, socketId: payload.socketId, emoji: payload.emoji },
                    ]);
                    setTimeout(() => {
                        setReactions((prev) => prev.filter((r) => r.id !== id));
                    }, 3000);
                },
            );

            socket.on("chat_message", (msg: ChatItem) => {
                if (cancelled) return;
                setChat((prev) => [...prev, msg]);
            });

            socket.on("consultation_ended", () => {
                if (cancelled) return;
                setPhase("ended");
                cleanup();
            });

            // Helpers bound to this effect's socket/cancel scope
            function createPeerConnection(
                peerSocketId: string,
            ): RTCPeerConnection {
                let pc = peerConnectionsRef.current.get(peerSocketId);
                if (pc) return pc;
                pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

                // Add local tracks
                if (localStreamRef.current) {
                    for (const track of localStreamRef.current.getTracks()) {
                        pc.addTrack(track, localStreamRef.current);
                    }
                }

                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.emit("signal", {
                            consultationId,
                            fromUserId: user!.id,
                            toSocketId: peerSocketId,
                            payload: { kind: "candidate", candidate: e.candidate.toJSON() },
                        });
                    }
                };

                pc.ontrack = (e) => {
                    const [stream] = e.streams;
                    if (!stream) return;
                    setRemoteStreams((prev) => {
                        const next = new Map(prev);
                        next.set(peerSocketId, stream);
                        return next;
                    });
                };

                pc.onconnectionstatechange = () => {
                    if (
                        pc!.connectionState === "failed" ||
                        pc!.connectionState === "closed"
                    ) {
                        closePeer(peerSocketId);
                    }
                };

                peerConnectionsRef.current.set(peerSocketId, pc);
                return pc;
            }

            async function this_offerTo(peerSocketId: string) {
                const pc = createPeerConnection(peerSocketId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit("signal", {
                    consultationId,
                    fromUserId: user!.id,
                    toSocketId: peerSocketId,
                    payload: { kind: "offer", sdp: offer },
                });
            }

            async function handleSignal(peerSocketId: string, payload: any) {
                if (!payload || !payload.kind) return;
                if (payload.kind === "offer") {
                    const pc = createPeerConnection(peerSocketId);
                    await pc.setRemoteDescription(payload.sdp);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit("signal", {
                        consultationId,
                        fromUserId: user!.id,
                        toSocketId: peerSocketId,
                        payload: { kind: "answer", sdp: answer },
                    });
                } else if (payload.kind === "answer") {
                    const pc = peerConnectionsRef.current.get(peerSocketId);
                    if (pc) await pc.setRemoteDescription(payload.sdp);
                } else if (payload.kind === "candidate" && payload.candidate) {
                    const pc = peerConnectionsRef.current.get(peerSocketId);
                    if (pc) {
                        try {
                            await pc.addIceCandidate(payload.candidate);
                        } catch (e) {
                            console.warn("addIceCandidate failed", e);
                        }
                    }
                }
            }

            function closePeer(peerSocketId: string) {
                const pc = peerConnectionsRef.current.get(peerSocketId);
                if (pc) {
                    pc.close();
                    peerConnectionsRef.current.delete(peerSocketId);
                }
                setPeers((prev) => {
                    const next = new Map(prev);
                    next.delete(peerSocketId);
                    return next;
                });
                setRemoteStreams((prev) => {
                    const next = new Map(prev);
                    next.delete(peerSocketId);
                    return next;
                });
            }

            function cleanup() {
                for (const pc of peerConnectionsRef.current.values()) pc.close();
                peerConnectionsRef.current.clear();
                socket.disconnect();
                if (localStreamRef.current) {
                    for (const t of localStreamRef.current.getTracks()) t.stop();
                    localStreamRef.current = null;
                }
                if (screenTrackRef.current) {
                    screenTrackRef.current.stop();
                    screenTrackRef.current = null;
                }
            }
        })();

        return () => {
            cancelled = true;
            const socket = socketRef.current;
            if (socket) {
                if (user) {
                    socket.emit("leave", { consultationId, userId: user.id });
                }
                socket.disconnect();
                socketRef.current = null;
            }
            for (const pc of peerConnectionsRef.current.values()) pc.close();
            peerConnectionsRef.current.clear();
            if (localStreamRef.current) {
                for (const t of localStreamRef.current.getTracks()) t.stop();
                localStreamRef.current = null;
            }
            if (screenTrackRef.current) {
                screenTrackRef.current.stop();
                screenTrackRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [consultationId, user?.id]);

    // ─── Send presence updates whenever local toggles change ─────────────────
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        presenceRef.current = {
            ...presenceRef.current,
            micOn,
            camOn,
            screenSharing: screenOn,
            handRaised,
        };
        socket.emit("presence_update", {
            consultationId,
            patch: {
                micOn,
                camOn,
                screenSharing: screenOn,
                handRaised,
            },
        });
    }, [micOn, camOn, screenOn, handRaised, consultationId]);

    // ─── Toggles ─────────────────────────────────────────────────────────────
    const toggleMic = () => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const next = !micOn;
        for (const t of stream.getAudioTracks()) t.enabled = next;
        setMicOn(next);
    };

    const toggleCam = () => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const next = !camOn;
        for (const t of stream.getVideoTracks()) t.enabled = next;
        setCamOn(next);
    };

    const toggleScreenShare = async () => {
        if (screenOn) {
            // Stop screen share, restore camera
            if (screenTrackRef.current) {
                screenTrackRef.current.stop();
                screenTrackRef.current = null;
            }
            const cam = cameraTrackRef.current;
            if (cam && localStreamRef.current) {
                for (const pc of peerConnectionsRef.current.values()) {
                    const sender = pc
                        .getSenders()
                        .find((s) => s.track && s.track.kind === "video");
                    if (sender) await sender.replaceTrack(cam);
                }
            }
            setScreenOn(false);
            return;
        }
        try {
            const display = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });
            const track = display.getVideoTracks()[0];
            if (!track) return;
            screenTrackRef.current = track;
            for (const pc of peerConnectionsRef.current.values()) {
                const sender = pc
                    .getSenders()
                    .find((s) => s.track && s.track.kind === "video");
                if (sender) await sender.replaceTrack(track);
            }
            track.onended = () => {
                // User stopped sharing via browser UI
                void toggleScreenShare();
            };
            setScreenOn(true);
        } catch (err) {
            console.warn("getDisplayMedia failed", err);
        }
    };

    const sendReaction = (emoji: string) => {
        socketRef.current?.emit("reaction", { consultationId, emoji });
        setShowReactionPicker(false);
    };

    const sendChat = () => {
        const text = chatDraft.trim();
        if (!text) return;
        socketRef.current?.emit("chat_message", { consultationId, text });
        setChatDraft("");
    };

    const leave = async () => {
        if (token && consultationId) {
            try {
                await consultationsApi.leave(consultationId, token);
            } catch {
                // ignore — UI cleanup matters more
            }
        }
        router.push("/consultations");
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    const peerList = useMemo(() => [...peers.values()], [peers]);
    const screenSharingPeer = peerList.find((p) => p.presence.screenSharing);

    return (
        <main className="fixed inset-0 z-50 flex flex-col bg-[#1B1F2B] font-sans text-white">
            <header className="flex h-[56px] items-center justify-between border-b border-white/5 bg-[#10131B] px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-[#22c55e] animate-pulse" />
                    <span className="text-sm font-semibold">
                        {phase === "live" ? "В ефірі" : phase === "connecting" ? "Підключення…" : phase === "ended" ? "Завершено" : "Очікування"}
                    </span>
                    <span className="ml-3 text-xs text-white/60">
                        Кімната #{consultationId}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setSidePanel((p) => (p === "participants" ? "none" : "participants"))
                        }
                        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            sidePanel === "participants"
                                ? "bg-white text-[#1B1F2B]"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                    >
                        <Users className="size-3.5" />
                        {peerList.length + 1}
                    </button>
                    <button
                        type="button"
                        onClick={() => setSidePanel((p) => (p === "chat" ? "none" : "chat"))}
                        className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                            sidePanel === "chat"
                                ? "bg-white text-[#1B1F2B]"
                                : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                    >
                        <MessageSquare className="size-3.5" />
                        Чат
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-red-600/90 px-6 py-2 text-sm text-white">{error}</div>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Main grid */}
                <section className="relative flex-1 overflow-auto p-4">
                    {phase === "connecting" && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1B1F2B]/70">
                            <Loader2 className="size-10 animate-spin text-white" />
                        </div>
                    )}
                    {screenSharingPeer ? (
                        <ScreenShareLayout
                            screenSharingPeer={screenSharingPeer}
                            peers={peerList}
                            remoteStreams={remoteStreams}
                            remoteVideoRefs={remoteVideoRefs.current}
                            localVideoRef={localVideoRef}
                            localPresence={{
                                micOn,
                                camOn,
                                screenSharing: screenOn,
                                handRaised,
                                name: user?.name ?? null,
                            }}
                            reactions={reactions}
                            selfSocketId={socketRef.current?.id ?? ""}
                        />
                    ) : (
                        <GalleryLayout
                            peers={peerList}
                            remoteStreams={remoteStreams}
                            remoteVideoRefs={remoteVideoRefs.current}
                            localVideoRef={localVideoRef}
                            localPresence={{
                                micOn,
                                camOn,
                                screenSharing: screenOn,
                                handRaised,
                                name: user?.name ?? null,
                            }}
                            reactions={reactions}
                            selfSocketId={socketRef.current?.id ?? ""}
                        />
                    )}
                </section>

                {/* Side panel */}
                {sidePanel === "participants" && (
                    <aside className="flex w-[300px] flex-col border-l border-white/10 bg-[#0F1320]">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                            <h3 className="text-sm font-semibold">Учасники ({peerList.length + 1})</h3>
                            <button onClick={() => setSidePanel("none")}>
                                <X className="size-4" />
                            </button>
                        </div>
                        <ul className="flex-1 space-y-1 overflow-y-auto px-2 py-2 text-sm">
                            <li className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-2">
                                <Avatar name={user?.name} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">{user?.name} (ви)</p>
                                    <PresenceBadges presence={{
                                        micOn,
                                        camOn,
                                        screenSharing: screenOn,
                                        handRaised,
                                        name: user?.name ?? null,
                                    }} />
                                </div>
                            </li>
                            {peerList.map((p) => (
                                <li
                                    key={p.socketId}
                                    className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-white/5"
                                >
                                    <Avatar name={p.presence.name} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">
                                            {p.presence.name ?? `User ${p.userId}`}
                                        </p>
                                        <PresenceBadges presence={p.presence} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                {sidePanel === "chat" && (
                    <aside className="flex w-[320px] flex-col border-l border-white/10 bg-[#0F1320]">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                            <h3 className="text-sm font-semibold">Чат</h3>
                            <button onClick={() => setSidePanel("none")}>
                                <X className="size-4" />
                            </button>
                        </div>
                        <ul className="flex-1 space-y-2 overflow-y-auto px-3 py-2 text-sm">
                            {chat.length === 0 ? (
                                <p className="py-6 text-center text-xs text-white/50">
                                    Поки що повідомлень немає.
                                </p>
                            ) : (
                                chat.map((m, idx) => (
                                    <li
                                        key={idx}
                                        className={`rounded-lg px-3 py-2 ${
                                            m.socketId === socketRef.current?.id
                                                ? "self-end bg-[#3f5fdb] text-white"
                                                : "bg-white/5"
                                        }`}
                                    >
                                        <p className="text-[11px] text-white/60">
                                            {m.name ?? `User ${m.userId}`} ·{" "}
                                            {new Date(m.at).toLocaleTimeString("uk-UA", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                        <p className="break-words text-sm">{m.text}</p>
                                    </li>
                                ))
                            )}
                        </ul>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendChat();
                            }}
                            className="flex gap-2 border-t border-white/10 p-3"
                        >
                            <input
                                value={chatDraft}
                                onChange={(e) => setChatDraft(e.target.value)}
                                placeholder="Повідомлення…"
                                className="flex-1 rounded-md bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:bg-white/15"
                            />
                            <button
                                type="submit"
                                disabled={!chatDraft.trim()}
                                className="rounded-md bg-[#5f72df] px-3 py-2 disabled:opacity-50"
                            >
                                <Send className="size-4" />
                            </button>
                        </form>
                    </aside>
                )}
            </div>

            {/* Controls */}
            <footer className="flex items-center justify-center gap-3 border-t border-white/10 bg-[#10131B] px-6 py-3">
                <CtrlBtn active={micOn} onClick={toggleMic} title={micOn ? "Вимкнути мікрофон" : "Увімкнути мікрофон"}>
                    {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
                </CtrlBtn>
                <CtrlBtn active={camOn} onClick={toggleCam} title={camOn ? "Вимкнути камеру" : "Увімкнути камеру"}>
                    {camOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
                </CtrlBtn>
                <CtrlBtn
                    active={screenOn}
                    onClick={toggleScreenShare}
                    title={screenOn ? "Зупинити демонстрацію" : "Демонструвати екран"}
                    accentColor={screenOn ? "#2563eb" : undefined}
                >
                    <MonitorUp className="size-4" />
                </CtrlBtn>
                <CtrlBtn
                    active={handRaised}
                    onClick={() => setHandRaised((v) => !v)}
                    title={handRaised ? "Опустити руку" : "Підняти руку"}
                    accentColor={handRaised ? "#f59e0b" : undefined}
                >
                    <Hand className="size-4" />
                </CtrlBtn>
                <div className="relative">
                    <CtrlBtn
                        active={showReactionPicker}
                        onClick={() => setShowReactionPicker((v) => !v)}
                        title="Реакція"
                    >
                        <Smile className="size-4" />
                    </CtrlBtn>
                    {showReactionPicker && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-xl border border-white/10 bg-[#1B1F2B] p-2 shadow-xl">
                            <div className="flex gap-1">
                                {REACTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => sendReaction(emoji)}
                                        className="rounded-md p-2 text-xl transition hover:bg-white/10"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={leave}
                    className="inline-flex items-center gap-2 rounded-md bg-[#dc2626] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b91c1c]"
                >
                    <PhoneOff className="size-4" />
                    Завершити
                </button>
            </footer>
        </main>
    );
}

function CtrlBtn({
    active,
    onClick,
    children,
    title,
    accentColor,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    accentColor?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                active
                    ? "text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
            }`}
            style={
                active
                    ? { backgroundColor: accentColor ?? "rgba(255,255,255,0.18)" }
                    : undefined
            }
        >
            {children}
        </button>
    );
}

function Avatar({ name }: { name: string | null | undefined }) {
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5f72df] text-xs font-bold">
            {initialOf(name)}
        </div>
    );
}

function PresenceBadges({ presence }: { presence: Presence }) {
    return (
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-white/60">
            {presence.handRaised && <span title="Піднята рука">✋</span>}
            {presence.screenSharing && <span title="Демонструє екран">🖥</span>}
            {!presence.micOn && (
                <MicOff className="size-3" aria-label="Mic off" />
            )}
            {!presence.camOn && (
                <VideoOff className="size-3" aria-label="Cam off" />
            )}
        </div>
    );
}

function VideoTile({
    stream,
    presence,
    self,
    label,
    videoRef,
    reactions,
}: {
    stream: MediaStream | null;
    presence: Presence;
    self?: boolean;
    label: string;
    videoRef?: (el: HTMLVideoElement | null) => void;
    reactions?: FloatingReaction[];
}) {
    const localRef = useRef<HTMLVideoElement | null>(null);
    useEffect(() => {
        if (videoRef) return; // external ref wires it
        if (localRef.current && stream) {
            localRef.current.srcObject = stream;
        }
    }, [stream, videoRef]);

    return (
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[#22273a]">
            {stream && presence.camOn ? (
                <video
                    ref={(el) => {
                        localRef.current = el;
                        if (videoRef) videoRef(el);
                        if (el && stream) el.srcObject = stream;
                    }}
                    autoPlay
                    playsInline
                    muted={self}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[#262b40] text-white/70">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#5f72df] text-2xl font-bold">
                        {initialOf(presence.name ?? label)}
                    </div>
                    <p className="mt-2 text-xs">{presence.name ?? label}</p>
                </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-[11px]">
                {presence.handRaised && <span>✋</span>}
                {!presence.micOn && <MicOff className="size-3" />}
                <span className="font-semibold">
                    {self ? `${presence.name ?? label} (ви)` : presence.name ?? label}
                </span>
            </div>
            {reactions && reactions.length > 0 && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end gap-1 pb-10 text-3xl">
                    {reactions.map((r) => (
                        <span key={r.id} className="animate-bounce">{r.emoji}</span>
                    ))}
                </div>
            )}
        </div>
    );
}

function GalleryLayout({
    peers,
    remoteStreams,
    remoteVideoRefs,
    localVideoRef,
    localPresence,
    reactions,
    selfSocketId,
}: {
    peers: PeerInfo[];
    remoteStreams: Map<string, MediaStream>;
    remoteVideoRefs: Map<string, HTMLVideoElement>;
    localVideoRef: React.MutableRefObject<HTMLVideoElement | null>;
    localPresence: Presence;
    reactions: FloatingReaction[];
    selfSocketId: string;
}) {
    const total = peers.length + 1;
    const cols = total <= 1 ? 1 : total <= 4 ? 2 : 3;
    return (
        <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
            <VideoTile
                stream={null /* assigned by ref below in actual render */}
                presence={localPresence}
                self
                label="Ви"
                videoRef={(el) => {
                    localVideoRef.current = el;
                }}
                reactions={reactions.filter((r) => r.socketId === selfSocketId)}
            />
            {peers.map((p) => (
                <VideoTile
                    key={p.socketId}
                    stream={remoteStreams.get(p.socketId) ?? null}
                    presence={p.presence}
                    label={p.presence.name ?? p.userId}
                    videoRef={(el) => {
                        if (el) remoteVideoRefs.set(p.socketId, el);
                        else remoteVideoRefs.delete(p.socketId);
                    }}
                    reactions={reactions.filter((r) => r.socketId === p.socketId)}
                />
            ))}
        </div>
    );
}

function ScreenShareLayout({
    screenSharingPeer,
    peers,
    remoteStreams,
    remoteVideoRefs,
    localVideoRef,
    localPresence,
    reactions,
    selfSocketId,
}: {
    screenSharingPeer: PeerInfo;
    peers: PeerInfo[];
    remoteStreams: Map<string, MediaStream>;
    remoteVideoRefs: Map<string, HTMLVideoElement>;
    localVideoRef: React.MutableRefObject<HTMLVideoElement | null>;
    localPresence: Presence;
    reactions: FloatingReaction[];
    selfSocketId: string;
}) {
    const otherPeers = peers.filter((p) => p.socketId !== screenSharingPeer.socketId);
    return (
        <div className="grid h-full grid-cols-[1fr_240px] gap-3">
            <VideoTile
                stream={remoteStreams.get(screenSharingPeer.socketId) ?? null}
                presence={screenSharingPeer.presence}
                label={`${screenSharingPeer.presence.name ?? "Учасник"} (екран)`}
                videoRef={(el) => {
                    if (el) remoteVideoRefs.set(screenSharingPeer.socketId, el);
                }}
                reactions={reactions.filter(
                    (r) => r.socketId === screenSharingPeer.socketId,
                )}
            />
            <div className="grid grid-cols-1 gap-2 overflow-y-auto">
                <VideoTile
                    stream={null}
                    presence={localPresence}
                    self
                    label="Ви"
                    videoRef={(el) => {
                        localVideoRef.current = el;
                    }}
                    reactions={reactions.filter((r) => r.socketId === selfSocketId)}
                />
                {otherPeers.map((p) => (
                    <VideoTile
                        key={p.socketId}
                        stream={remoteStreams.get(p.socketId) ?? null}
                        presence={p.presence}
                        label={p.presence.name ?? p.userId}
                        videoRef={(el) => {
                            if (el) remoteVideoRefs.set(p.socketId, el);
                        }}
                        reactions={reactions.filter((r) => r.socketId === p.socketId)}
                    />
                ))}
            </div>
        </div>
    );
}
