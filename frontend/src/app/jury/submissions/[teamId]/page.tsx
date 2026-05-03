'use client';

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useState, use } from "react";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function TeamEvaluationPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);

  const [scores, setScores] = useState({ crit1: "", crit2: "", crit3: "" });
  const [comment, setComment] = useState("");

  const totalScore = (Number(scores.crit1) || 0) + (Number(scores.crit2) || 0) + (Number(scores.crit3) || 0);

  const displayTeamName = teamId.includes("team-") 
    ? teamId.replace("team-", "Команда ") 
    : teamId;

  return (
    <div className={`min-h-screen flex flex-col bg-white text-black w-full ${inter.className}`}>
      
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-5 bg-[#1B345B] w-full">
        <Link href="/jury/submissions" className="bg-[#95BCF0] text-black px-6 py-2 rounded-md flex items-center gap-2 font-medium hover:bg-[#7ca9e6] transition-all cursor-pointer">
          <span>←</span> Повернутися
        </Link>
        <div className="flex items-center gap-8">
          <div className="flex items-center font-medium tracking-wide bg-gradient-to-r from-[#F91B1B] to-[#EB9626] bg-clip-text text-transparent">
            <Link href="?lang=uk" className="text-sm mb-5 -mr-1 hover:scale-110 transition-transform cursor-pointer">UKR</Link>
            <span className="text-[42px] font-light italic leading-none mx-0.5 select-none">/</span>
            <Link href="?lang=en" className="text-sm mt-6 -ml-1 hover:scale-110 transition-transform cursor-pointer">ENG</Link>
          </div>
          <div className="flex items-center gap-3 select-none">
            <span className="text-3xl font-semibold text-white tracking-wide">FoldUp</span>
            <img src="/image/logo.png" alt="FoldUp Logo" className="h-10 w-auto" />
          </div>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="flex bg-[#E5E5E5] border-y border-black/20 w-full mt-10">
        <Link href="/jury/eco-quest" className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer">
          Головна <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
        </Link>
        <Link href="/jury/leaderboard" className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer">
          Лідерборд <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
        </Link>
        <Link href="/jury/submissions" className="px-10 py-4 bg-[#D9D9D9] border-r border-black/20 border-b-2 border-b-black text-lg flex items-center gap-2 font-medium cursor-pointer underline underline-offset-4">
          Список робіт для оцінювання <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L13 1" /></svg>
        </Link>
      </nav>

      <main className="flex-1 p-12 lg:p-20 space-y-16">
        
        <h2 className="text-4xl font-medium uppercase">{displayTeamName}</h2>

        {/* Evaluation Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="border border-black w-44 h-12"></th>
                <th className="border border-black p-3 text-left font-medium">Критерій 1</th>
                <th className="border border-black p-3 text-left font-medium">Критерій 2</th>
                <th className="border border-black p-3 text-left font-medium">Критерій 3</th>
                <th className="border border-black p-3 text-left font-bold">Загальна сума балів</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-4 font-medium bg-gray-50">{displayTeamName}</td>
                <td className="border border-black p-0">
                  <input 
                    type="number" 
                    value={scores.crit1}
                    onChange={(e) => setScores({...scores, crit1: e.target.value})}
                    className="w-full h-full p-4 focus:bg-blue-50 outline-none text-xl transition-colors"
                  />
                </td>
                <td className="border border-black p-0">
                  <input 
                    type="number" 
                    value={scores.crit2}
                    onChange={(e) => setScores({...scores, crit2: e.target.value})}
                    className="w-full h-full p-4 focus:bg-blue-50 outline-none text-xl transition-colors"
                  />
                </td>
                <td className="border border-black p-0">
                  <input 
                    type="number" 
                    value={scores.crit3}
                    onChange={(e) => setScores({...scores, crit3: e.target.value})}
                    className="w-full h-full p-4 focus:bg-blue-50 outline-none text-xl transition-colors"
                  />
                </td>
                <td className="border border-black p-4 text-xl font-bold bg-gray-50">
                  {totalScore > 0 ? totalScore : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Опис — ТЕПЕР НА ВСЮ ШИРИНУ ЯК КОМЕНТАРІ */}
        <section className="space-y-4">
          <h3 className="text-3xl font-medium">Опис</h3>
          <p className="text-2xl leading-relaxed w-full">
            Текст з коротким описом роботи. (користувач може писати необмежений текст по кількості символів)
          </p>
        </section>

        {/* Відео */}
        <section className="space-y-6">
          <h3 className="text-3xl font-medium">Відео презентація</h3>
          <div className="relative w-full max-w-5xl aspect-video bg-[#D9D9D9] flex items-center justify-center group cursor-pointer border border-black/10">
            <div className="w-24 h-24 bg-[#555555] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
            </div>
          </div>
        </section>

        {/* GitHub */}
        <section className="space-y-4">
          <h3 className="text-3xl font-medium">Посилання на GitHub</h3>
          <Link href="https://github.com/team_name/repository.git" target="_blank" className="text-2xl text-blue-600 italic hover:underline block">
            https://github.com/team_name/repository.git
          </Link>
        </section>

        <p className="text-2xl italic text-gray-700">Можливі роз’яснення щодо роботи, додаткові фотографії</p>

        {/* Коментарі */}
        <section className="space-y-6">
          <h3 className="text-4xl font-medium">Коментарі</h3>
          <div className="w-full bg-[#F5F5F5] border border-black/5 focus-within:border-[#EB9626]/30 transition-colors">
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Залишити коментар..."
                className="w-full p-10 min-h-[150px] text-2xl bg-transparent outline-none resize-none placeholder:text-gray-500"
              />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#E5E5E5] py-12 border-t border-black text-center mt-20">
        <p className="mb-4 font-medium text-2xl">© 2026 FoldUp</p>
        <div className="text-gray-700 flex justify-center gap-1 text-xl">
          Усі права захищено. [Політика конфіденційності] | [Умови використання] | [Контакти]
        </div>
      </footer>
    </div>
  );
}