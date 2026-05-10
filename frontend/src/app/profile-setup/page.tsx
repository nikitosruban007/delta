"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Loader2, Instagram, Youtube, Github, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
);

const inputClass = "w-full bg-[#F0F0F0] border border-[#D0D0D0] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#6082e6] transition placeholder:text-[#999]";
const labelClass = "block text-[13px] font-semibold text-[#111] mb-2";

export default function ProfileSetupPage() {
    const router = useRouter();
    const { token, user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const nameParts = (user?.name ?? "").split(" ");
    const [firstName, setFirstName] = useState(nameParts[0] ?? "");
    const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
    const [login, setLogin] = useState(user?.email?.split("@")[0] ?? "");
    const [bio, setBio] = useState("");
    const [age, setAge] = useState("");
    const [skills, setSkills] = useState("");
    const [contacts, setContacts] = useState("");
    const [instagram, setInstagram] = useState("");
    const [telegram, setTelegram] = useState("");
    const [youtube, setYoutube] = useState("");
    const [github, setGithub] = useState("");
    const [company, setCompany] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const updateMutation = useMutation({
        mutationFn: () =>
            authApi.updateProfile(
                { name: `${firstName.trim()} ${lastName.trim()}`.trim() || user?.name },
                token!,
            ),
        onSuccess: () => {
            setSaved(true);
            setTimeout(() => router.push("/dashboard"), 800);
        },
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
    };

    const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || user?.name?.[0]?.toUpperCase() || "?";

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

            <div className="mx-auto w-full max-w-[1000px] px-8 py-10 flex-1">
                <h1 className="text-[28px] font-bold text-[#111] mb-1">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Заповніть профіль"}
                </h1>
                <p className="text-[14px] text-[#888] mb-8">Доповніть інформацію про себе, щоб інші учасники могли вас знайти.</p>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left column */}
                    <div className="flex flex-col gap-5 flex-1">
                        {/* Avatar */}
                        <div className="flex items-center gap-6 mb-2">
                            <div className="relative shrink-0">
                                <div
                                    className="w-[100px] h-[100px] rounded-full bg-[#D9D9D9] flex items-center justify-center text-[32px] font-bold text-[#555] overflow-hidden cursor-pointer hover:opacity-90 transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#6082e6] flex items-center justify-center text-white shadow-sm hover:bg-[#4d6bca] transition"
                                >
                                    <Camera size={16} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div className="text-[13px] text-[#666]">
                                <p className="font-medium text-[#111]">Фото профілю</p>
                                <p className="mt-1">Підтримуються .jpg, .png (до 2 МБ)</p>
                            </div>
                        </div>

                        {/* Name fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Ім'я</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Ім'я"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Прізвище</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Прізвище"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Login */}
                        <div>
                            <label className={labelClass}>Логін</label>
                            <input
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                placeholder="Ваш логін"
                                className={inputClass}
                            />
                        </div>

                        {/* Bio */}
                        <div>
                            <label className={labelClass}>Про себе</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={5}
                                placeholder="Розкажіть трохи про себе..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        {/* Student verification */}
                        <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                            <h3 className="text-[14px] font-bold text-[#111] mb-3">Верифікація студента</h3>
                            <p className="text-[12px] text-[#666] mb-4">
                                Завантажте документ, що підтверджує ваш студентський статус
                            </p>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Student ID або номер залікової книжки"
                                        className={`${inputClass} flex-1`}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => docInputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 border-2 border-dashed border-[#C0C0C0] rounded-lg px-4 py-3 text-[13px] text-[#666] hover:border-[#6082e6] hover:text-[#6082e6] transition"
                                >
                                    <Camera size={16} />
                                    Завантажити документ
                                </button>
                                <input ref={docInputRef} type="file" accept=".pdf,.jpg,.png" className="hidden" />
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-5 w-full lg:w-[380px] shrink-0">
                        {/* Age */}
                        <div>
                            <label className={labelClass}>Вік</label>
                            <input
                                type="number"
                                min={14}
                                max={100}
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="Ваш вік"
                                className={inputClass}
                            />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className={labelClass}>Навички</label>
                            <textarea
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                rows={3}
                                placeholder="React, Node.js, Python..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        {/* Contacts */}
                        <div>
                            <label className={labelClass}>Контакти</label>
                            <textarea
                                value={contacts}
                                onChange={(e) => setContacts(e.target.value)}
                                rows={3}
                                placeholder="Телефон, месенджери..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        {/* Social media */}
                        <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-sm">
                            <h3 className="text-[14px] font-bold text-[#111] mb-4">Соціальні мережі</h3>
                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: <Instagram size={18} />, placeholder: "Instagram", value: instagram, setter: setInstagram },
                                    { icon: <TelegramIcon />, placeholder: "Telegram", value: telegram, setter: setTelegram },
                                    { icon: <Youtube size={18} />, placeholder: "YouTube", value: youtube, setter: setYoutube },
                                    { icon: <Github size={18} />, placeholder: "GitHub", value: github, setter: setGithub },
                                ].map(({ icon, placeholder, value, setter }) => (
                                    <div key={placeholder} className="flex items-center gap-3">
                                        <span className="text-[#555] shrink-0">{icon}</span>
                                        <input
                                            type="url"
                                            value={value}
                                            onChange={(e) => setter(e.target.value)}
                                            placeholder={placeholder}
                                            className={inputClass}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <label className={labelClass}>Компанія</label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Назва компанії або навчального закладу"
                                className={inputClass}
                            />
                        </div>

                        {/* Save/Skip */}
                        <div className="flex items-center gap-4 mt-2">
                            <button
                                type="button"
                                onClick={() => updateMutation.mutate()}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2 bg-[#6082e6] hover:bg-[#4d6bca] disabled:opacity-50 disabled:cursor-not-allowed transition text-white px-8 py-3 rounded-lg text-[14px] font-semibold shadow-sm"
                            >
                                {updateMutation.isPending ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                                {saved ? "Збережено!" : "Зберегти"}
                            </button>
                            <Link
                                href="/dashboard"
                                className="text-[14px] text-[#888] hover:text-[#111] transition font-medium"
                            >
                                Пропустити →
                            </Link>
                        </div>

                        {updateMutation.error && (
                            <p className="text-[#E06C75] text-[13px]">
                                {(updateMutation.error as Error).message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <footer className="w-full bg-[#EAEAEA] py-6 text-center text-[12px] font-medium text-[#666] mt-auto border-t border-[#E0E0E0]">
                <p>© 2026 FoldUp. Усі права захищено.</p>
                <p className="mt-1">[Політика конфіденційності] | [Умови використання] | [Контакти]</p>
            </footer>
        </main>
    );
}
