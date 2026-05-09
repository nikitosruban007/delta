"use client";

import Link from "next/link";
import {
    ChevronUp,
    Search,
    Plus,
    Eye,
    MessageSquare,
    Clock,
    Tag
} from "lucide-react";

// Mock data based on the screenshot
const forumPosts = [
    {
        id: 1,
        votes: 353,
        title: "Помилка 404 при запуску Node.js",
        description: "При запуску Node.js вискакує помилка 404, що в такій ситуації робити? 💻",
        author: "Ярослав",
        avatar: "https://i.pravatar.cc/150?u=yaroslav",
        views: 4558,
        comments: 92,
        time: "3 год. тому",
        tags: ["Backend", "Node.js", "Помилки"]
    },
    {
        id: 2,
        votes: 236,
        title: "Як ваші справи?",
        description: "Як ваші справи?",
        author: "Андрій",
        avatar: "https://i.pravatar.cc/150?u=andriy",
        views: 3566,
        comments: 144,
        time: "3 год. тому",
        tags: ["Спілкування"]
    },
    {
        id: 3,
        votes: 220,
        title: "Технології для сайту з турнірами",
        description: "Всім привіт, є питання, я хочу створити цілісний сайт для проведення всяких різних турнірів...",
        author: "Петро",
        avatar: "https://i.pravatar.cc/150?u=petro",
        views: 4558,
        comments: 92,
        time: "3 год. тому",
        tags: ["Backend", "Frontend", "Full Stack"]
    },
    {
        id: 4,
        votes: 196,
        title: "Помилка 404 при запуску Node.js",
        description: "При запуску Node.js вискакує помилка 404, що в такій ситуації робити? 💻",
        author: "Ярослав",
        avatar: "https://i.pravatar.cc/150?u=yaroslav",
        views: 4558,
        comments: 92,
        time: "3 год. тому",
        tags: ["Backend", "Node.js", "Помилки"]
    },
    {
        id: 5,
        votes: 150,
        title: "Помилка 404 при запуску Node.js",
        description: "При запуску Node.js вискакує помилка 404, що в такій ситуації робити? 💻",
        author: "Ярослав",
        avatar: "https://i.pravatar.cc/150?u=yaroslav",
        views: 4558,
        comments: 92,
        time: "3 год. тому",
        tags: ["Backend", "Node.js", "Помилки"]
    },
    {
        id: 6,
        votes: 112,
        title: "Помилка 404 при запуску Node.js",
        description: "При запуску Node.js вискакує помилка 404, що в такій ситуації робити? 💻",
        author: "Ярослав",
        avatar: "https://i.pravatar.cc/150?u=yaroslav",
        views: 4558,
        comments: 92,
        time: "3 год. тому",
        tags: ["Backend", "Node.js", "Помилки"]
    },
    {
        id: 7,
        votes: 96,
        title: "Помилка 404 при запуску Node.js",
        description: "При запуску Node.js вискакує помилка 404, що в такій ситуації робити? 💻",
        author: "Ярослав",
        avatar: "https://i.pravatar.cc/150?u=yaroslav",
        views: 4558,
        comments: 92,
        time: "3 год. тому",
        tags: ["Backend", "Node.js", "Помилки"]
    }
];

const popularTags = [
    "Backend", "Backend", "Backend",
    "Спілкування", "Спілкування", "Спілкування",
    "Спілкування", "Спілкування", "Frontend"
];

export default function ForumPage() {
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
    <div className="mx-auto w-full max-w-[1200px] px-8 py-10 flex-1">
        {/* Title Section */}
        <div className="mb-8">
    <h1 className="text-[32px] font-bold text-[#111]">Форум</h1>
        <p className="mt-2 text-[14px] text-[#666]">
        Тут ти можеш спілкуватися з іншими користувачами, задавати якісь питання, або комусь допомогти
    </p>
    </div>

    {/* Search and Action Bar */}
    <div className="flex gap-4 mb-6">
    <div className="flex-1 flex items-center bg-white border border-[#E0E0E0] rounded-lg px-4 py-3 shadow-sm focus-within:border-[#1B345B] transition">
    <Search size={20} className="text-[#888] shrink-0" />
    <input
        type="text"
    placeholder="Найкраща мова для frontend..., #Node.js"
    className="w-full bg-transparent outline-none px-3 text-[14px] placeholder:text-[#888]"
        />
        </div>
        <Link
    href="/forum/add"
    className="flex items-center gap-2 bg-[#6082e6] hover:bg-[#4d6bca] transition text-white px-6 py-3 rounded-lg font-medium shadow-sm shrink-0"
    >
    <Plus size={20} />
    Нова гілка
    </Link>
    </div>

    {/* Layout Grid (Posts + Sidebar) */}
    <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Posts List */}
        <div className="flex-1 w-full bg-white border border-[#E0E0E0] rounded-xl shadow-sm divide-y divide-[#E0E0E0]">
        {forumPosts.map((post) => (
                <Link
                    key={post.id}
            href="/forum/sms"
            className="flex p-6 hover:bg-gray-50 transition cursor-pointer group"
                >
                {/* Votes */}
                <div className="flex flex-col items-center mr-6 text-[#888] group-hover:text-[#6082e6] shrink-0 w-12">
            <ChevronUp size={28} strokeWidth={1.5} />
    <span className="text-[13px] font-medium mt-1 text-[#444] group-hover:text-[#6082e6]">
        {post.votes}
        </span>
        </div>

    {/* Post Content */}
    <div className="flex-1 min-w-0">
    <h3 className="text-[18px] font-semibold text-[#111] leading-snug">
        {post.title}
        </h3>
        <p className="mt-2 text-[14px] text-[#666] truncate">
        {post.description}
        </p>

    {/* Meta Info */}
    <div className="flex items-center justify-between mt-5">
    <div className="flex items-center gap-3">
    <img
        src={post.avatar}
    alt={post.author}
    className="w-8 h-8 rounded-full bg-gray-200 object-cover"
    />
    <span className="text-[14px] font-medium text-[#111]">
        {post.author}
        </span>
        </div>

        <div className="flex items-center gap-5 text-[13px] text-[#888]">
    <span className="flex items-center gap-1.5">
    <Eye size={16} /> {post.views}
    </span>
    <span className="flex items-center gap-1.5">
    <MessageSquare size={16} /> {post.comments}
    </span>
    <span className="flex items-center gap-1.5">
    <Clock size={16} /> {post.time}
    </span>
    </div>
    </div>

    {/* Tags */}
    <div className="flex flex-wrap gap-2 mt-5">
        {post.tags.map((tag, idx) => (
                <span
                    key={idx}
            className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E0E0E0] text-[#666] px-3 py-1.5 rounded-md text-[11px] font-medium"
            >
            <Tag size={12} className="opacity-70" />
                {tag}
                </span>
))}
    </div>
    </div>
    </Link>
))}
    </div>

    {/* Sidebar */}
    <div className="w-full lg:w-[320px] shrink-0 bg-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm">
    <h3 className="text-[16px] font-bold text-[#111] mb-5">
        Популярні теги
    </h3>
    <div className="flex flex-wrap gap-2">
        {popularTags.map((tag, idx) => (
                <Link
                    key={idx}
            href="#"
            className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E0E0E0] text-[#666] px-3 py-1.5 rounded-md text-[11px] font-medium hover:bg-[#EAEAEA] transition"
            >
            <Tag size={12} className="opacity-70" />
                {tag}
                </Link>
))}
    </div>
    </div>
    </div>

    {/* Pagination */}
    <div className="mt-8 flex items-center justify-between pb-8">
    <span className="text-[13px] text-[#888] font-medium">
        Показано 7 із 269 гілок
    </span>
    <div className="flex items-center gap-2">
        {[1, 2, 3].map((page) => (
        <button
            key={page}
    className={`w-9 h-9 flex items-center justify-center rounded-md text-[13px] font-medium border transition ${
        page === 1
            ? "bg-white border-[#D0D0D0] text-[#111] shadow-sm"
            : "bg-transparent border-transparent text-[#666] hover:bg-white hover:border-[#D0D0D0]"
    }`}
>
    {page}
    </button>
))}
    <span className="w-9 h-9 flex items-center justify-center text-[#888]">...</span>
    <button className="w-9 h-9 flex items-center justify-center rounded-md text-[13px] font-medium text-[#666] border border-transparent hover:bg-white hover:border-[#D0D0D0] transition">
        25
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-md text-[13px] font-medium text-[#666] border border-[#D0D0D0] bg-white shadow-sm hover:bg-gray-50 transition">
        &gt;
        </button>
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