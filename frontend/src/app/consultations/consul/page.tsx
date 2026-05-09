"use client";

import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

export default function ConsultationDetailPage() {
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

            {/* Main Content Area */}
            <div className="mx-auto w-full max-w-[1000px] px-8 py-10 flex-1">

                {/* Breadcrumbs */}
                <div className="mb-6 text-[14px] font-medium text-[#111]">
                    <Link href="/consultations" className="text-[#888] hover:text-[#111] transition">
                        ← Консультації
                    </Link>
                    <span className="text-[#888] mx-2">/</span>
                    React Hooks: Поглиблене вивчення
                </div>

                {/* Consultation Card */}
                <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 md:p-10 shadow-sm">

                    {/* Top Row: Status & Time */}
                    <div className="flex flex-wrap items-center gap-6 mb-6">
            <span className="bg-[#4CAF50] text-white px-4 py-1.5 rounded-md text-[13px] font-semibold tracking-wide">
              Йде зараз
            </span>
                        <div className="flex items-center gap-2 text-[14px] text-[#666] font-medium">
                            <Calendar size={16} />
                            25 квітня 2026
                        </div>
                        <div className="flex items-center gap-2 text-[14px] text-[#666] font-medium">
                            <Clock size={16} />
                            14:00-15:00
                        </div>
                    </div>

                    {/* Title & Action Button */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <h1 className="text-[32px] md:text-[36px] font-bold text-[#111] leading-tight">
                            React Hooks: Поглиблене вивчення
                        </h1>
                        <Link
                            href="/consultations/meet"
                            className="bg-[#6082e6] hover:bg-[#4d6bca] transition text-white px-10 py-3 rounded-lg text-[15px] font-semibold shadow-sm shrink-0 active:scale-[0.98] inline-flex items-center justify-center"
                        >
                            Увійти
                        </Link>
                    </div>

                    {/* Mentor */}
                    <div className="text-[16px] text-[#111] mb-6">
                        <span className="font-semibold">Ментор:</span> Комаров Іван Юрійович
                    </div>

                    {/* Description */}
                    <p className="text-[15px] text-[#444] leading-relaxed mb-10 text-justify">
                        (Опис консультації) Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque faucibus, turpis nec pretium
                        dignissim, orci enim euismod arcu, a venenatis felis leo eu arcu. In scelerisque enim sed faucibus tincidunt. Donec ut
                        lacus dignissim, viverra ipsum hendrerit, eleifend odio. Aliquam ac lectus scelerisque, malesuada nibh eu, porttitor
                        libero. Aliquam et purus vel dolor consequat efficitur. Proin elit nunc, accumsan nec lacus eu, blandit tempus arcu.
                        Aliquam non ligula ac lectus blandit rhoncus. Phasellus ultrices sollicitudin facilisis. Sed mattis eros non mauris
                        interdum, vel consequat justo pretium. Integer sed tortor vitae libero tempus fermentum. Aliquam lobortis, risus sed
                        imperdiet dapibus, tortor magna tempus sapien, eget lobortis nibh purus non libero.
                    </p>

                    {/* Attachments & Links Section */}
                    <div className="mb-10">
                        <h2 className="text-[22px] font-bold text-[#111] mb-4">
                            Закріплені файли та посилання:
                        </h2>
                        <div className="flex flex-col gap-3 mb-8">
                            <a href="#" className="text-[15px] text-[#1f62df] hover:underline underline-offset-4">
                                https://kman.kyiv.ua/
                            </a>
                            <a href="#" className="text-[15px] text-[#1f62df] hover:underline underline-offset-4">
                                https://www.facebook.com/oksana.kovalenko.944
                            </a>
                        </div>

                        {/* File Placeholders */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-[#E0E0E0] aspect-[4/3] rounded-sm flex items-center justify-center text-[#444] font-medium text-[15px]">
                                PPTX
                            </div>
                            <div className="bg-[#E0E0E0] aspect-[4/3] rounded-sm flex items-center justify-center text-[#444] font-medium text-[15px]">
                                IMG
                            </div>
                            <div className="bg-[#E0E0E0] aspect-[4/3] rounded-sm flex items-center justify-center text-[#444] font-medium text-[15px]">
                                PPTX
                            </div>
                        </div>
                    </div>

                    {/* Additional Comments */}
                    <div>
                        <h2 className="text-[22px] font-bold text-[#111] mb-3">
                            Додаткові коментарі ментора:
                        </h2>
                        <p className="text-[15px] text-[#444] leading-relaxed">
                            Домашнє завдання:
                            <br />
                            Прочитати, проаналізувати презентації, передивитись посилання.
                        </p>
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