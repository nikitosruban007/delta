"use client";

import Link from "next/link";
import { useState } from "react";
import { Paperclip, Send, Tag } from "lucide-react";

export default function CreateForumThreadPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const suggestedTags = ["Спілкування", "Backend", "Frontend", "Full Stack"];

    const handleClear = () => {
        setTitle("");
        setDescription("");
    };

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

                {/* Page Titles */}
                <h1 className="text-[36px] font-bold text-[#111] mb-2 leading-tight">
                    Створення нової гілки
                </h1>
                <p className="text-[14px] text-[#666] mb-10">
                    Будьте точними. Чим точніше ваше питання, тим краща буде відповідь.
                </p>

                {/* Two Column Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left Column - Form */}
                    <div className="flex-1 w-full flex flex-col gap-6">

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
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3.5 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm resize-none"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {description.length} символів
                            </div>
                        </div>

                        {/* Files Section */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-3">
                                Файли <span className="text-[#888] font-normal text-[13px]">(до 6 об'єктів)</span>
                            </label>
                            <button className="flex items-center gap-2 bg-[#F5F5F5] hover:bg-[#EAEAEA] transition border border-[#D0D0D0] px-4 py-2.5 rounded-lg text-[14px] font-medium text-[#444] shadow-sm">
                                <Paperclip size={18} className="text-[#666]" />
                                Вибрати файли
                            </button>

                            {/* File Grid Placeholders */}
                            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 mt-4 max-w-[500px]">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[4/3] bg-[#D9D9D9] rounded-md w-full"></div>
                                ))}
                            </div>
                        </div>

                        {/* Tags Section */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2 mt-2">
                                Теги <span className="text-[#888] font-normal text-[13px]">(до 5 тегів)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="#....."
                                className="w-full max-w-[500px] bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                            />

                            {/* Suggested Tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {suggestedTags.map((tag, idx) => (
                                    <button
                                        key={idx}
                                        className="flex items-center gap-1.5 bg-white border border-[#E0E0E0] text-[#666] px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-[#F5F5F5] transition"
                                    >
                                        <Tag size={12} className="opacity-70" />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mt-4">
                            <button className="bg-[#6082e6] hover:bg-[#4d6bca] transition text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold flex items-center gap-2 shadow-sm active:scale-[0.98]">
                                <Send size={18} />
                                Опублікувати
                            </button>
                            <button
                                onClick={handleClear}
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
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Чітко вкажіть технологію, версію та середовище (наприклад: Node.js 20, React 19, Ubuntu).
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Опишіть проблему поетапно: що зробили, що очікували отримати, і що сталося фактично.
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Додайте текст помилки або скріншот — без цього більшість проблем вирішуються навмання.
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Прикріпіть мінімальний фрагмент коду, який відтворює проблему, а не весь проєкт.
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Використовуйте релевантні теги — це підвищує шанс, що питання побачать потрібні спеціалісти.
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Для гілок які створені не для розв'язання проблеми, обов'язково виберіть тег "Спілкування"
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <footer className="w-full bg-[#EAEAEA] py-6 text-center text-[12px] font-medium text-[#666] mt-auto border-t border-[#E0E0E0]">
                © 2026 FoldUp. Усі права захищено.
            </footer>
        </main>
    );
}