"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowDown,
    ArrowUp,
    CornerUpLeft,
    Flag,
    Loader2,
    Send,
    Tag,
} from "lucide-react";
import { forumApi, type ForumPost } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/shared/Footer";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

type ThreadNode = ForumPost & { children: ThreadNode[] };

function buildThread(posts: ForumPost[]): ThreadNode[] {
    const map = new Map<number, ThreadNode>();
    const roots: ThreadNode[] = [];
    for (const p of posts) {
        map.set(p.id, { ...p, children: [] });
    }
    for (const node of map.values()) {
        if (node.parentId && map.has(node.parentId)) {
            map.get(node.parentId)!.children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}

export default function ForumTopicPage() {
    const params = useParams<{ id: string }>();
    const topicId = params.id;
    const queryClient = useQueryClient();
    const { token, isAuthenticated, user } = useAuth();
    const [replyText, setReplyText] = useState("");
    const [replyToId, setReplyToId] = useState<number | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [reportingId, setReportingId] = useState<number | null>(null);
    const [reportReason, setReportReason] = useState("");

    const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
        queryKey: ["forum-topic", topicId],
        queryFn: () => forumApi.getTopic(topicId),
        retry: false,
    });

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ["forum-posts", topicId, Boolean(token)],
        queryFn: () => forumApi.listPosts(topicId, { limit: 100 }, token),
        enabled: Boolean(topic),
    });

    const posts = postsData?.items ?? [];
    const tree = useMemo(() => buildThread(posts), [posts]);
    const firstPost = posts.find((p) => p.parentId === null) ?? posts[0];

    const replyMutation = useMutation({
        mutationFn: async () => {
            if (!token) throw new Error("Необхідна авторизація");
            if (!replyText.trim()) throw new Error("Відповідь не може бути порожньою");
            return forumApi.createPost(
                topicId,
                { content: replyText.trim(), parentId: replyToId ?? undefined },
                token,
            );
        },
        onSuccess: () => {
            setReplyText("");
            setReplyToId(null);
            setSubmitError(null);
            queryClient.invalidateQueries({ queryKey: ["forum-posts", topicId] });
        },
        onError: (err: Error) => setSubmitError(err.message),
    });

    const voteMutation = useMutation({
        mutationFn: async ({ postId, value }: { postId: number; value: 1 | -1 | 0 }) => {
            if (!token) throw new Error("Необхідна авторизація");
            return forumApi.votePost(postId, value, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forum-posts", topicId] });
        },
    });

    const reportMutation = useMutation({
        mutationFn: async ({ postId, reason }: { postId: number; reason: string }) => {
            if (!token) throw new Error("Необхідна авторизація");
            return forumApi.reportPost(postId, reason, token);
        },
        onSuccess: () => {
            setReportingId(null);
            setReportReason("");
        },
    });

    if (topicLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
                <Loader2 size={40} className="animate-spin text-[#6082e6]" />
            </div>
        );
    }

    if (topicError || !topic) {
        notFound();
    }

    const handleVote = (post: ForumPost, value: 1 | -1) => {
        if (!isAuthenticated) return;
        const next: 1 | -1 | 0 = post.myVote === value ? 0 : value;
        voteMutation.mutate({ postId: post.id, value: next });
    };

    const renderPost = (node: ThreadNode, depth: number) => {
        const indent = Math.min(depth, 5) * 28;
        const isOwn = user?.id && Number(user.id) === node.author?.id;
        return (
            <div key={node.id} style={{ marginLeft: indent }} className="mb-3">
                <div className="flex gap-4 rounded-xl border border-[#E0E0E0] bg-white p-4 shadow-sm">
                    {/* Vote column */}
                    <div className="flex w-10 shrink-0 flex-col items-center gap-1 text-[#666]">
                        <button
                            type="button"
                            onClick={() => handleVote(node, 1)}
                            disabled={!isAuthenticated || isOwn || node.isDeleted}
                            className={`rounded-md p-1 transition ${
                                node.myVote === 1
                                    ? "bg-[#dcfce7] text-[#166534]"
                                    : "hover:bg-[#f5f5f5] disabled:opacity-40 disabled:hover:bg-transparent"
                            }`}
                            aria-label="Upvote"
                        >
                            <ArrowUp size={18} />
                        </button>
                        <span className="text-[13px] font-semibold text-[#111]">{node.score}</span>
                        <button
                            type="button"
                            onClick={() => handleVote(node, -1)}
                            disabled={!isAuthenticated || isOwn || node.isDeleted}
                            className={`rounded-md p-1 transition ${
                                node.myVote === -1
                                    ? "bg-[#fee2e2] text-[#991b1b]"
                                    : "hover:bg-[#f5f5f5] disabled:opacity-40 disabled:hover:bg-transparent"
                            }`}
                            aria-label="Downvote"
                        >
                            <ArrowDown size={18} />
                        </button>
                    </div>
                    {/* Body */}
                    <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-3 text-[12px] text-[#666]">
                            <span className="font-semibold text-[#111]">
                                {node.author?.name ?? "Невідомий"}
                            </span>
                            <span>{formatDate(node.createdAt)}</span>
                        </div>
                        {node.isDeleted ? (
                            <p className="italic text-[#888]">[видалено]</p>
                        ) : (
                            <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-[#111]">
                                {node.content}
                            </p>
                        )}
                        {/* Actions */}
                        {!node.isDeleted && (
                            <div className="mt-3 flex items-center gap-3 text-[12px] text-[#666]">
                                {isAuthenticated && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplyToId(node.id);
                                            setSubmitError(null);
                                            const el = document.getElementById("reply-box");
                                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                                        }}
                                        className="inline-flex items-center gap-1 hover:text-[#111]"
                                    >
                                        <CornerUpLeft size={14} />
                                        Відповісти
                                    </button>
                                )}
                                {isAuthenticated && !isOwn && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReportingId(node.id);
                                            setReportReason("");
                                        }}
                                        className="inline-flex items-center gap-1 text-[#a0263c] hover:text-[#7c1d2e]"
                                    >
                                        <Flag size={13} />
                                        Поскаржитися
                                    </button>
                                )}
                            </div>
                        )}
                        {/* Inline report form */}
                        {reportingId === node.id && (
                            <div className="mt-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] p-3">
                                <textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    rows={2}
                                    placeholder="Опишіть причину скарги (мін. 3 символи)…"
                                    className="w-full resize-none rounded-md border border-[#fecaca] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#dc2626]"
                                />
                                <div className="mt-2 flex justify-end gap-2 text-[12px]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReportingId(null);
                                            setReportReason("");
                                        }}
                                        className="px-3 py-1 text-[#666] transition hover:text-[#111]"
                                    >
                                        Скасувати
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            reportMutation.mutate({ postId: node.id, reason: reportReason })
                                        }
                                        disabled={reportMutation.isPending || reportReason.trim().length < 3}
                                        className="rounded-md bg-[#dc2626] px-3 py-1 font-semibold text-white transition hover:bg-[#b91c1c] disabled:opacity-50"
                                    >
                                        {reportMutation.isPending ? "Надсилаємо…" : "Надіслати скаргу"}
                                    </button>
                                </div>
                                {reportMutation.isSuccess && (
                                    <p className="mt-2 text-[12px] text-green-700">Скаргу зареєстровано.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {node.children.length > 0 && (
                    <div className="mt-2">
                        {node.children.map((c) => renderPost(c, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <main className="min-h-screen flex flex-col bg-[#F4F7FB] font-sans text-[#161616]">
            <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
                <Link
                    href="/forum"
                    className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
                >
                    <span className="text-lg leading-none">←</span> Повернутися
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-[24px] font-semibold tracking-wide">FoldUp</span>
                </div>
            </header>

            <div className="mx-auto w-full max-w-[1000px] px-8 py-10 flex-1">
                <div className="mb-6 text-[14px] font-medium text-[#111]">
                    <Link href="/forum" className="text-[#888] hover:text-[#111] transition">
                        ← Форум
                    </Link>
                    {topic.category && (
                        <>
                            <span className="text-[#888] mx-2">/</span>
                            <span className="text-[#888]">{topic.category.title}</span>
                        </>
                    )}
                    <span className="text-[#888] mx-2">/</span>
                    {topic.title}
                </div>

                {/* Topic header (first post lives inside thread, header shows title/tags) */}
                <div className="mb-8 rounded-xl border border-[#E0E0E0] bg-white p-8 shadow-sm">
                    <div className="mb-3 flex items-center gap-3 text-[13px] text-[#666]">
                        <span className="font-semibold text-[#111]">
                            {topic.author?.name ?? "Невідомий"}
                        </span>
                        {topic.createdAt && <span>{formatDate(topic.createdAt)}</span>}
                    </div>
                    <h1 className="mb-3 text-[28px] font-bold leading-tight text-[#111]">
                        {topic.title}
                    </h1>
                    {topic.tags && topic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {topic.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-[#E0E0E0] bg-[#F5F5F5] px-3 py-1.5 text-[11px] font-medium text-[#666]"
                                >
                                    <Tag size={12} className="opacity-70" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-6 flex items-center gap-4">
                    <h2 className="shrink-0 text-[18px] font-semibold text-[#111]">
                        {posts.length} {posts.length === 1 ? "повідомлення" : "повідомлень"}
                    </h2>
                    <div className="h-[2px] flex-1 bg-[#111]"></div>
                </div>

                {postsLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-[#6082e6]" />
                    </div>
                ) : tree.length === 0 ? (
                    <p className="rounded-xl border border-[#E0E0E0] bg-white px-6 py-10 text-center text-[14px] text-[#666]">
                        Ще немає повідомлень. Будьте першим!
                    </p>
                ) : (
                    tree.map((node) => renderPost(node, 0))
                )}

                {/* Reply form */}
                <div id="reply-box" className="mt-8 rounded-xl border border-[#E0E0E0] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[16px] font-semibold text-[#111]">
                            {replyToId ? `Відповідь на повідомлення #${replyToId}` : "Нове повідомлення в темі"}
                        </h3>
                        {replyToId !== null && (
                            <button
                                type="button"
                                onClick={() => setReplyToId(null)}
                                className="text-[12px] text-[#666] hover:text-[#111]"
                            >
                                ← Відповісти в темі
                            </button>
                        )}
                    </div>
                    {isAuthenticated ? (
                        <>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Напишіть вашу відповідь..."
                                rows={5}
                                className="w-full resize-none rounded-lg border border-[#E0E0E0] bg-[#F4F7FB] px-4 py-3 text-[14px] outline-none transition focus:border-[#1B345B]"
                            />
                            {submitError && (
                                <p className="mt-2 text-[13px] text-[#E06C75]">{submitError}</p>
                            )}
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={() => replyMutation.mutate()}
                                    disabled={replyMutation.isPending || !replyText.trim()}
                                    className="flex items-center gap-2 rounded-lg bg-[#6082e6] px-6 py-2.5 text-[14px] font-medium text-white shadow-sm transition hover:bg-[#4d6bca] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {replyMutation.isPending ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                    Відповісти
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-[14px] text-[#888]">
                            <Link href="/login" className="font-medium text-[#6082e6] hover:underline">
                                Увійдіть
                            </Link>{" "}
                            щоб залишити відповідь
                        </p>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
