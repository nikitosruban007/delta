"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ChevronUp,
    CornerUpLeft,
    Flag,
    Send,
    Tag,
    Loader2,
} from "lucide-react";
import { forumApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/shared/Footer";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ForumTopicPage() {
    const params = useParams<{ id: string }>();
    const topicId = params.id;
    const queryClient = useQueryClient();
    const { token, isAuthenticated } = useAuth();
    const [replyText, setReplyText] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
        queryKey: ["forum-topic", topicId],
        queryFn: () => forumApi.getTopic(topicId),
        retry: false,
    });

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ["forum-posts", topicId],
        queryFn: () => forumApi.listPosts(topicId, { limit: 100 }),
        enabled: Boolean(topic),
    });

    const posts = postsData?.items ?? [];

    const replyMutation = useMutation({
        mutationFn: async () => {
            if (!token) throw new Error("Необхідна авторизація");
            if (!replyText.trim()) throw new Error("Відповідь не може бути порожньою");
            return forumApi.createPost(topicId, { content: replyText.trim() }, token);
        },
        onSuccess: () => {
            setReplyText("");
            setSubmitError(null);
            queryClient.invalidateQueries({ queryKey: ["forum-posts", topicId] });
        },
        onError: (err: Error) => {
            setSubmitError(err.message);
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

    const firstPost = posts[0];
    const replies = posts.slice(1);

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
                    <img src="/image/orange_icon.png" alt="FoldUp Logo" className="h-8 w-auto" />
                </div>
            </header>

            <div className="mx-auto w-full max-w-[1000px] px-8 py-10 flex-1">
                {/* Breadcrumbs */}
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

                {/* Original post */}
                <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 shadow-sm mb-10 flex gap-6">
                    <div className="flex flex-col items-center shrink-0 w-20">
                        <div className="w-14 h-14 rounded-full bg-[#E4EDFA] flex items-center justify-center text-[#1B345B] text-[20px] font-bold mb-2">
                            {topic.author?.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-semibold text-[13px] text-[#111] text-center">
                            {topic.author?.name ?? "Невідомий"}
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        {topic.createdAt && (
                            <div className="text-[13px] text-[#888] mb-2">{formatDate(topic.createdAt)}</div>
                        )}

                        <h1 className="text-[28px] font-bold text-[#111] mb-4 leading-tight">
                            {topic.title}
                        </h1>

                        {topic.tags && topic.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {topic.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E0E0E0] text-[#666] px-3 py-1.5 rounded-md text-[11px] font-medium"
                                    >
                                        <Tag size={12} className="opacity-70" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {firstPost && (
                            <p className="text-[15px] text-[#111] whitespace-pre-wrap leading-relaxed">
                                {firstPost.content}
                            </p>
                        )}
                    </div>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-[18px] font-semibold text-[#111] shrink-0">
                                {replies.length} {replies.length === 1 ? "відповідь" : "відповіді"}
                            </h2>
                            <div className="h-[2px] bg-[#111] flex-1"></div>
                        </div>

                        {replies.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm mb-4 flex gap-6"
                            >
                                <div className="flex flex-col items-center shrink-0 w-16">
                                    <div className="w-12 h-12 rounded-full bg-[#E4EDFA] flex items-center justify-center text-[#1B345B] text-[16px] font-bold mb-1">
                                        {post.author?.name?.[0]?.toUpperCase() ?? "?"}
                                    </div>
                                    <span className="font-semibold text-[12px] text-[#111] text-center">
                                        {post.author?.name ?? "Невідомий"}
                                    </span>
                                </div>
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    {post.createdAt && (
                                        <div className="text-[12px] text-[#888] mb-2">{formatDate(post.createdAt)}</div>
                                    )}
                                    <p className="text-[14px] text-[#111] whitespace-pre-wrap leading-relaxed">
                                        {post.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {postsLoading && (
                    <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-[#6082e6]" />
                    </div>
                )}

                {/* Reply form */}
                <div className="mt-8 bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
                    <h3 className="text-[16px] font-semibold text-[#111] mb-4">Ваша відповідь</h3>
                    {isAuthenticated ? (
                        <>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Напишіть вашу відповідь..."
                                rows={5}
                                className="w-full bg-[#F4F7FB] border border-[#E0E0E0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition resize-none"
                            />
                            {submitError && (
                                <p className="text-[#E06C75] text-[13px] mt-2">{submitError}</p>
                            )}
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={() => replyMutation.mutate()}
                                    disabled={replyMutation.isPending || !replyText.trim()}
                                    className="flex items-center gap-2 bg-[#6082e6] hover:bg-[#4d6bca] disabled:opacity-50 disabled:cursor-not-allowed transition text-white px-6 py-2.5 rounded-lg text-[14px] font-medium shadow-sm"
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
                            <Link href="/login" className="text-[#6082e6] hover:underline font-medium">
                                Увійдіть
                            </Link>{" "}
                            щоб залишити відповідь
                        </p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
