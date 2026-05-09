"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ChevronUp,
    CornerUpLeft,
    Flag,
    Send,
    Tag
} from "lucide-react";

export default function ForumPostPage() {
    const [replyText, setReplyText] = useState("");

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
    <div className="mb-6 text-[14px] font-medium text-[#111]">
    <Link href="/forum" className="text-[#888] hover:text-[#111] transition">
            ← Форум
    </Link>
    <span className="text-[#888] mx-2">/</span>
    Помилка 404 при запуску Node.js
    </div>

    <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 shadow-sm mb-12 flex gap-6">
    <div className="flex flex-col items-center shrink-0 w-24">
    <img
        src="https://i.pravatar.cc/150?u=yaroslav"
    alt="Ярослав"
    className="w-16 h-16 rounded-full bg-gray-200 object-cover mb-3"
    />
    <span className="font-semibold text-[14px] text-[#111]">Ярослав</span>
        </div>

        <div className="flex-1 min-w-0">
    <div className="text-[13px] text-[#888] mb-2">5 травня 2026 - 14:20</div>

    <h1 className="text-[28px] font-bold text-[#111] mb-4 leading-tight">
        Помилка 404 при запуску Node.js
    </h1>

    <div className="flex flex-wrap gap-2 mb-6">
        {["Backend", "Node.js", "Помилки"].map((tag, idx) => (
        <span
            key={idx}
    className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E0E0E0] text-[#666] px-3 py-1.5 rounded-md text-[11px] font-medium"
    >
    <Tag size={12} className="opacity-70" />
        {tag}
        </span>
))}
    </div>

    <p className="text-[15px] text-[#111] mb-6">
        При запуску Node.js вискакує помилка 404, що в такій ситуації робити?
        </p>

        <div className="bg-[#2B2F3A] rounded-md p-5 text-[#A9B1D6] font-mono text-[13px] leading-[1.6] max-w-[700px] relative overflow-hidden shadow-sm">
        <p className="mb-2 text-[#565F89]">/path/to/app.js:5</p>
    <div className="border border-[#F7768E] p-2 relative rounded-sm bg-[#362A38] mb-4">
    <p>
        <span className="text-[#E06C75]">greet</span>
        <span className="text-[#A9B1D6]">(</span>
        <span className="text-[#98C379]">"World"</span>
        <span className="text-[#A9B1D6]">   </span>
        <span className="text-[#565F89]">// Missing closing parenthesis</span>
        </p>
        <p className="text-[#F7768E] ml-[44px]">^</p>
        <div className="absolute right-[-45px] top-1/2 -translate-y-1/2 flex items-center text-[#F7768E]">
    <div className="h-0.5 w-10 bg-[#F7768E]"></div>
        <div className="w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-[#F7768E]"></div>
        </div>
        </div>
        <p>SyntaxError: Unexpected end of input</p>
    <p className="ml-4">at Object.compileFunction (node:vm:360:18)</p>
    <p className="ml-4">at wrapSafe (node:internal/modules/cjs/loader:1088:15)</p>
    <p className="ml-4">at Module._compile (node:internal/modules/cjs/loader:1123:27)</p>
    <p className="ml-4">at Module._extensions..js (node:internal/modules/cjs/loader:1213:10)</p>
    <p className="ml-4">at Module.load (node:internal/modules/cjs/loader:1037:32)</p>
    <p className="ml-4">at Module._load (node:internal/modules/cjs/loader:878:12)</p>
    <p className="ml-4">at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)</p>
    <p className="ml-4">at node:internal/main/run_main_module:23:47</p>
    <p className="mt-4 text-[#565F89]">Node.js v18.16.0</p>
    </div>
    </div>
    </div>

    <div className="flex items-center gap-4 mb-6">
    <h2 className="text-[18px] font-semibold text-[#111] shrink-0">2 відповіді</h2>
    <div className="h-[2px] bg-[#111] flex-1"></div>
        </div>

        <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm mb-4 flex gap-6">
    <div className="flex flex-col items-center shrink-0 w-20">
    <img
        src="https://i.pravatar.cc/150?u=andriy"
    alt="Андрій"
    className="w-14 h-14 rounded-full bg-gray-200 object-cover mb-2"
    />
    <span className="font-semibold text-[13px] text-[#111]">Андрій</span>
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
    <p className="text-[14px] text-[#111] mb-6 mt-1">
        Треба закрити дужки там де greet("World", це 5 строка Вашого коду
    </p>
    <div className="flex items-center justify-between mt-auto">
    <div className="flex items-center gap-5 text-[13px] text-[#888] font-medium">
    <button className="flex items-center gap-1.5 hover:text-[#6082e6] transition">
    <ChevronUp size={16} strokeWidth={2.5} /> 15
    </button>
    <button className="flex items-center gap-1.5 hover:text-[#6082e6] transition">
    <CornerUpLeft size={16} /> Відповісти
    </button>
    <button className="flex items-center gap-1.5 hover:text-red-500 transition">
    <Flag size={16} /> Поскаржитись
    </button>
    </div>
    <div className="text-[12px] font-medium text-[#888]">5 травня 2026 - 14:28</div>
    </div>
    </div>
    </div>

    <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm mb-12 ml-16 flex gap-6">
    <div className="flex flex-col items-center shrink-0 w-20">
    <img
        src="https://i.pravatar.cc/150?u=yaroslav"
    alt="Ярослав"
    className="w-14 h-14 rounded-full bg-gray-200 object-cover mb-2"
    />
    <span className="font-semibold text-[13px] text-[#111]">Ярослав</span>
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
    <div>
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#888] mb-2">
    <CornerUpLeft size={14} /> Відповідає Андрію
    </div>
    <p className="text-[14px] text-[#111] mb-6">
        Дякую!
        </p>
        </div>
        <div className="flex items-center justify-between mt-auto">
    <div className="flex items-center gap-5 text-[13px] text-[#888] font-medium">
    <button className="flex items-center gap-1.5 hover:text-[#6082e6] transition">
    <ChevronUp size={16} strokeWidth={2.5} /> 15
    </button>
    <button className="flex items-center gap-1.5 hover:text-[#6082e6] transition">
    <CornerUpLeft size={16} /> Відповісти
    </button>
    <button className="flex items-center gap-1.5 hover:text-red-500 transition">
    <Flag size={16} /> Поскаржитись
    </button>
    </div>
    <div className="text-[12px] font-medium text-[#888]">5 травня 2026 - 14:50</div>
    </div>
    </div>
    </div>

    <div className="bg-white border border-[#E0E0E0] rounded-xl p-8 shadow-sm">
    <h2 className="text-[20px] font-semibold text-[#111] mb-6">Відповісти</h2>
        <div className="flex gap-6">
    <div className="flex flex-col items-center shrink-0 w-20">
    <img
        src="https://i.pravatar.cc/150?u=me"
    alt="Я"
    className="w-14 h-14 rounded-full bg-gray-200 object-cover mb-2"
    />
    <span className="font-semibold text-[13px] text-[#111]">Я</span>
        </div>
        <div className="flex-1">
    <textarea
        className="w-full h-[140px] border border-[#D0D0D0] rounded-lg bg-[#F9FAFC] p-4 text-[14px] resize-none outline-none focus:border-[#6082e6] transition shadow-inner"
    value={replyText}
    onChange={(e) => setReplyText(e.target.value)}
    />
    <div className="flex items-center justify-between mt-3">
    <span className="text-[13px] text-[#888] font-medium">{replyText.length} символів</span>
    <button className="bg-[#6082e6] hover:bg-[#4d6bca] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold flex items-center gap-2 transition active:scale-[0.98]">
    <Send size={18} /> Відповісти
    </button>
    </div>
    </div>
    </div>
    </div>
    </div>

    <footer className="w-full bg-[#EAEAEA] py-6 text-center text-[12px] font-medium text-[#666] mt-auto border-t border-[#E0E0E0]">
        © 2026 FoldUp. Усі права захищено.
    </footer>
    </main>
);
}