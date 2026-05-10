"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, Paperclip, Plus, Send } from "lucide-react";

export default function CreateConsultationPage() {
    const [topic, setTopic] = useState("");
    const [tournament, setTournament] = useState("");
    const [description, setDescription] = useState("");
    const [link, setLink] = useState("");
    const [comments, setComments] = useState("");

    const handleClear = () => {
        setTopic("");
        setTournament("");
        setDescription("");
        setLink("");
        setComments("");
    };

    return (
        <main className="min-h-screen flex flex-col bg-[#F4F7FB] font-sans text-[#161616]">
            {/* Header */}
            <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
                <Link
                    href="/consultations"
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

                {/* Two Column Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left Column - Form */}
                    <div className="flex-1 w-full flex flex-col gap-6">

                        <div className="mb-2">
                            <h1 className="text-[36px] font-bold text-[#111] mb-2 leading-tight">
                                Створення консультації
                            </h1>
                            <p className="text-[14px] text-[#666]">
                                Вказуйте інформацію вірно для запобігання незручностей!
                            </p>
                        </div>

                        {/* Topic Input */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Тема консультації <span className="text-[#E06C75]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Робота у команді"
                                maxLength={120}
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {topic.length}/120
                            </div>
                        </div>

                        {/* Tournament Input */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Турнір в рамках якого буде консультація <span className="text-[#E06C75]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Competitive 2026"
                                value={tournament}
                                onChange={(e) => setTournament(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                            />
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Опис <span className="text-[#E06C75]">*</span>
                            </label>
                            <textarea
                                placeholder="Lorem ipsum dolor sit amet"
                                rows={7}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm resize-none"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {description.length} символів
                            </div>
                        </div>

                        {/* Files & Links Section */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Файли та посилання <span className="text-[#888] font-normal text-[13px]">(до 6 об'єктів кожного виду)</span>
                            </label>

                            <div className="flex gap-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="https://......"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="flex-1 max-w-[400px] bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm"
                                />
                                <button className="w-[50px] bg-[#6082e6] hover:bg-[#4d6bca] transition text-white rounded-lg flex items-center justify-center shadow-sm">
                                    <Plus size={24} />
                                </button>
                            </div>

                            <button className="flex items-center gap-2 bg-[#F5F5F5] hover:bg-[#EAEAEA] transition border border-[#D0D0D0] px-4 py-2.5 rounded-lg text-[14px] font-medium text-[#444] shadow-sm mb-4">
                                <Paperclip size={18} className="text-[#666]" />
                                Вибрати файли
                            </button>

                            {/* File Grid Placeholders */}
                            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-3 max-w-[500px]">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="aspect-[4/3] bg-[#D9D9D9] rounded-md w-full"></div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Comments Textarea */}
                        <div>
                            <label className="block text-[15px] font-semibold text-[#111] mb-2">
                                Додаткові коментарі
                            </label>
                            <textarea
                                placeholder="Lorem ipsum dolor sit amet"
                                rows={5}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="w-full bg-white border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#1B345B] transition shadow-sm resize-none"
                            />
                            <div className="text-right text-[12px] text-[#888] mt-1 font-medium">
                                {comments.length} символів
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mt-2">
                            <button className="bg-[#6082e6] hover:bg-[#4d6bca] transition text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold flex items-center gap-2 shadow-sm active:scale-[0.98]">
                                <Send size={18} />
                                Опублікувати
                            </button>
                            <button
                                onClick={handleClear}
                                className="bg-white hover:bg-gray-50 transition text-[#111] px-8 py-3.5 rounded-lg text-[15px] font-semibold shadow-sm border border-[#E0E0E0] active:scale-[0.98]"
                            >
                                Очистити
                            </button>
                        </div>

                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="w-full lg:w-[380px] shrink-0 bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#111] mb-5">
                            Поради при створенні консультації
                        </h3>

                        <div className="flex flex-col gap-2.5">
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Чітко вкажіть тему консультації/заняття
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Вкажіть турнір в рамках якого буде проведена консультація
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Не обширно опишіть що буде відбуватися на консультації/занятті
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                Вставте необхідні матеріали (файли, посилання) у відповідному розділі
                            </div>
                            <div className="border border-[#EAEAEA] bg-[#F9FAFC] p-3.5 rounded-md text-[13px] text-[#555] leading-relaxed">
                                За бажанням, напишіть якісь додаткові коментарі до консультації/заняття. Це може бути до прикладу домашнім завданням
                            </div>
                        </div>
                    </div>

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