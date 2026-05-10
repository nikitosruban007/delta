"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Send, Tag, X } from "lucide-react";
import { forumApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import Footer from "@/components/shared/Footer";

const SUGGESTED_TAGS = ["Спілкування", "Backend", "Frontend", "Full Stack", "Node.js", "React", "Помилки"];

export default function CreateForumThreadPage() {
    const router = useRouter();
    const { token, isAuthenticated } = useAuth();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { data: categories } = useQuery({
        queryKey: ["forum-categories"],
        queryFn: () => forumApi.listCategories(),
    });

    const addTag = (tag: string) => {
        const t = tag.trim().replace(/^#/, "");
        if (t && tags.length < 5 && !tags.includes(t)) {
            setTags((prev) => [...prev, t]);
        }
        setTagInput("");
    };

    const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!token) throw new Error("Необхідна авторизація");
            if (!title.trim()) throw new Error("Вкажіть назву гілки");
            if (!content.trim()) throw new Error("Вкажіть опис");
            if (!categoryId) throw new Error("Виберіть категорію");
            return forumApi.createTopic(
                { categoryId: Number(categoryId), title: title.trim(), content: content.trim(), tags },
                token,
            );
        },
        onSuccess: (topic) => {
            router.push(`/forum/${topic.id}`);
        },
        onError: (err: Error | ApiError) => {
            setSubmitError(err.message);
        },
    });

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#F4F7FB]">
                <div className="text-center">
                    <p className="text-[#666] mb-4">Для створення гілки необхідно увійти</p>
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

            {/* Main Content Area */}
            <div className="mx-auto w-full max-w-[1200px] px-8 py-10 flex-1">
                {/* Breadcrumbs */}
                <div className="mb-6 text-[14px] font-medium text-[#111]">
                    <Link href="/forum" className="text-[#888] hover:text-[#111] transition">
                        ← Форум
                    </Link>
                    <span className="text-[#888] mx-2">/</span>
                    Нова Гілка
                </div>

                <h1 className="text-[36px] font-bold text-[#111] mb-2 leading-tight">
                    Створення нової гілки
                </h1>
                <p className="text-[14px] text-[#666] mb-10">
                    Будьте точними. Чим точніше ваше питання, тим краща буде відповідь.
                </p>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column - Form */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        {/* Category */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Категорія <span className="text-[#E06C75]">*</span>
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3.5 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                            >
                                <option value="">Виберіть категорію</option>
                                {(categories ?? []).map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Title Input */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Назва <span className="text-[#E06C75]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Проєкт на Node.js"
                                maxLength={120}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3.5 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {title.length}/120
                            </div>
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Опис <span className="text-[#E06C75]">*</span>
                            </label>
                            <textarea
                                placeholder="Вітаю! У мене проблема з Node.js, я ....."
                                rows={8}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3.5 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm resize-none"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {content.length} символів
                            </div>
                        </div>

                        {/* Tags Section */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2 mt-2">
                                Теги <span className="text-[#888] font-normal text-[13px]">(до 5 тегів)</span>
                            </label>

                            {/* Added tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="flex items-center gap-1.5 bg-[#6082e6] text-white px-3 py-1.5 rounded-md text-[12px] font-medium"
                                        >
                                            <Tag size={12} />
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 opacity-70 hover:opacity-100"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 max-w-[500px]">
                                <input
                                    type="text"
                                    placeholder="#Backend..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === ",") {
                                            e.preventDefault();
                                            addTag(tagInput);
                                        }
                                    }}
                                    disabled={tags.length >= 5}
                                    className="flex-1 bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm disabled:opacity-50"
                                />
                                <button
                                    onClick={() => addTag(tagInput)}
                                    disabled={!tagInput.trim() || tags.length >= 5}
                                    className="bg-[#F5F5F5] border border-[#D0D0D0] px-4 py-3 rounded-lg text-[14px] font-medium hover:bg-[#EAEAEA] transition disabled:opacity-50"
                                >
                                    Додати
                                </button>
                            </div>

                            {/* Suggested Tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => addTag(tag)}
                                        disabled={tags.length >= 5}
                                        className="flex items-center gap-1.5 bg-white border border-[#E0E0E0] text-[#666] px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-[#F5F5F5] transition disabled:opacity-40"
                                    >
                                        <Tag size={12} className="opacity-70" />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {submitError && (
                            <p className="text-[#E06C75] text-[14px] font-medium">{submitError}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mt-4">
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
                                onClick={() => { setTitle(""); setContent(""); setTags([]); setSubmitError(null); }}
                                disabled={createMutation.isPending}
                                className="bg-white hover:bg-gray-50 transition text-[#111] px-8 py-3.5 rounded-lg text-[15px] font-semibold shadow-md active:scale-[0.98]"
                            >
                                Очистити
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="w-full lg:w-[380px] shrink-0 bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#111] mb-5">
                            Поради при створенні гілки
                        </h3>
                        <div className="flex flex-col gap-2.5">
                            {[
                                "Чітко вкажіть технологію, версію та середовище (наприклад: Node.js 20, React 19, Ubuntu).",
                                "Опишіть проблему поетапно: що зробили, що очікували отримати, і що сталося фактично.",
                                "Додайте текст помилки або скріншот — без цього більшість проблем вирішуються навмання.",
                                "Прикріпіть мінімальний фрагмент коду, який відтворює проблему, а не весь проєкт.",
                                "Використовуйте релевантні теги — це підвищує шанс, що питання побачать потрібні спеціалісти.",
                                "Для гілок які створені не для розв'язання проблеми, обов'язково виберіть тег \"Спілкування\"",
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
