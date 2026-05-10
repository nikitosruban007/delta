"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import Footer from "@/components/shared/Footer";
import {
    ChevronUp,
    Search,
    Plus,
    Eye,
    MessageSquare,
    Clock,
    Tag,
    Loader2,
} from "lucide-react";
import { forumApi, type ForumTopicListItem, type ForumCategory } from "@/lib/api";

function timeAgo(dateStr: string, language: string, t: (k: string) => string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return t("time.min_ago").replace("{n}", String(minutes));
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("time.h_ago").replace("{n}", String(hours));
    const days = Math.floor(hours / 24);
    return t("time.d_ago").replace("{n}", String(days));
}

export default function ForumPage() {
    const { t, language } = useLanguage();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    const { data: topicsData, isLoading } = useQuery({
        queryKey: ["forum-topics", search, page],
        queryFn: () => forumApi.listTopics({ page, limit: LIMIT, search: search || undefined }),
    });

    const { data: categories } = useQuery({
        queryKey: ["forum-categories"],
        queryFn: () => forumApi.listCategories(),
    });

    const topics = topicsData?.items ?? [];
    const pagination = topicsData?.pagination;

    const popularTags = Array.from(
        new Set(topics.flatMap((t) => t.tags ?? []))
    ).slice(0, 12);

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
            <div className="mx-auto w-full max-w-[1200px] px-8 py-10 flex-1">
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-[32px] font-bold text-[#111]">{t("forum.title")}</h1>
                    <p className="mt-2 text-[14px] text-[#666]">
                        {t("forum.subtitle")}
                    </p>
                </div>

                {/* Search and Action Bar */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 flex items-center bg-white border border-[#E0E0E0] rounded-lg px-4 py-3 shadow-sm focus-within:border-[#1B345B] transition">
                        <Search size={20} className="text-[#888] shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder={t("forum.search_placeholder")}
                            className="w-full bg-transparent outline-none px-3 text-[14px] placeholder:text-[#888]"
                        />
                    </div>
                    <Link
                        href="/forum/add"
                        className="flex items-center gap-2 bg-[#6082e6] hover:bg-[#4d6bca] transition text-white px-6 py-3 rounded-lg font-medium shadow-sm shrink-0"
                    >
                        <Plus size={20} />
                        {t("forum.new_topic")}
                    </Link>
                </div>

                {/* Layout Grid (Posts + Sidebar) */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Posts List */}
                    <div className="flex-1 w-full bg-white border border-[#E0E0E0] rounded-xl shadow-sm divide-y divide-[#E0E0E0] min-h-[200px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={32} className="animate-spin text-[#6082e6]" />
                            </div>
                        ) : topics.length === 0 ? (
                            <div className="py-16 text-center text-[#888] text-[14px]">
                                {search ? t("common.nothing_found") : t("forum.empty_topics")}
                            </div>
                        ) : (
                            topics.map((topic) => (
                                <Link
                                    key={topic.id}
                                    href={`/forum/${topic.id}`}
                                    className="flex p-6 hover:bg-gray-50 transition cursor-pointer group"
                                >
                                    {/* Votes placeholder */}
                                    <div className="flex flex-col items-center mr-6 text-[#888] group-hover:text-[#6082e6] shrink-0 w-12">
                                        <ChevronUp size={28} strokeWidth={1.5} />
                                        <span className="text-[13px] font-medium mt-1 text-[#444] group-hover:text-[#6082e6]">
                                            {topic.postsCount}
                                        </span>
                                    </div>

                                    {/* Post Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[18px] font-semibold text-[#111] leading-snug">
                                            {topic.title}
                                        </h3>
                                        {topic.category && (
                                            <p className="mt-1 text-[12px] text-[#888]">
                                                {topic.category.title}
                                            </p>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#E4EDFA] flex items-center justify-center text-[#1B345B] text-[12px] font-bold">
                                                    {topic.author?.name?.[0]?.toUpperCase() ?? "?"}
                                                </div>
                                                <span className="text-[14px] font-medium text-[#111]">
                                                    {topic.author?.name ?? t("common.unknown")}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-5 text-[13px] text-[#888]">
                                                <span className="flex items-center gap-1.5">
                                                    <MessageSquare size={16} /> {topic.postsCount}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={16} />
                                                    {topic.createdAt ? timeAgo(topic.createdAt, language, t) : ""}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {topic.tags && topic.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
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
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-[320px] shrink-0 space-y-4">
                        {/* Popular tags */}
                        <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
                            <h3 className="text-[16px] font-bold text-[#111] mb-5">{t("forum.tags.popular")}</h3>
                            {popularTags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {popularTags.map((tag, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSearch(tag)}
                                            className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E0E0E0] text-[#666] px-3 py-1.5 rounded-md text-[11px] font-medium hover:bg-[#EAEAEA] transition"
                                        >
                                            <Tag size={12} className="opacity-70" />
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[13px] text-[#888]">{t("forum.tags_placeholder")}</p>
                            )}
                        </div>

                        {/* Categories */}
                        {categories && categories.length > 0 && (
                            <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
                                <h3 className="text-[16px] font-bold text-[#111] mb-5">{t("forum.categories.title")}</h3>
                                <div className="flex flex-col gap-2">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="flex items-center justify-between text-[13px]">
                                            <span className="text-[#333]">{cat.title}</span>
                                            <span className="text-[#888] font-medium">{cat.topicsCount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-between pb-8">
                        <span className="text-[13px] text-[#888] font-medium">
                            {t("forum.pagination_shown").replace("{shown}", String(topics.length)).replace("{total}", String(pagination.total))}
                        </span>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-md text-[13px] font-medium border transition ${
                                        p === page
                                            ? "bg-white border-[#D0D0D0] text-[#111] shadow-sm"
                                            : "bg-transparent border-transparent text-[#666] hover:bg-white hover:border-[#D0D0D0]"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            {pagination.pages > 5 && (
                                <>
                                    <span className="w-9 h-9 flex items-center justify-center text-[#888]">...</span>
                                    <button
                                        onClick={() => setPage(pagination.pages)}
                                        className="w-9 h-9 flex items-center justify-center rounded-md text-[13px] font-medium text-[#666] border border-transparent hover:bg-white hover:border-[#D0D0D0] transition"
                                    >
                                        {pagination.pages}
                                    </button>
                                </>
                            )}
                            {page < pagination.pages && (
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    className="w-9 h-9 flex items-center justify-center rounded-md text-[13px] font-medium text-[#666] border border-[#D0D0D0] bg-white shadow-sm hover:bg-gray-50 transition"
                                >
                                    &gt;
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </main>
    );
}
