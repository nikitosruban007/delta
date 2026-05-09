import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function LeaderboardPage() {
  const criteria = ["Технічна частина", "Функціональність", "Креативність", "Презентація"];
  const teamsCount = 12; 
  const teams = Array.from({ length: teamsCount }, (_, i) => `Команда ${i + 1}`);

  return (
    <div className={`min-h-screen flex flex-col bg-white text-black w-full ${inter.className}`}>
      {/* HEADER (твій остаточний варіант) */}
      <header className="flex justify-between items-center px-8 py-5 bg-[#1B345B] w-full">
        <Link href="/jury/eco-quest" className="bg-[#95BCF0] text-black px-6 py-2 rounded-md flex items-center gap-2 font-medium hover:bg-[#7ca9e6] transition-all cursor-pointer">
          <span>←</span> Повернутися
        </Link>
        <div className="flex items-center gap-8">
          <div className="flex items-center font-medium tracking-wide bg-gradient-to-r from-[#F91B1B] to-[#EB9626] bg-clip-text text-transparent">
            <Link href="?lang=uk" className="text-sm mb-5 -mr-1 hover:brightness-75 transition-all cursor-pointer">UKR</Link>
            <span className="text-[42px] font-light italic leading-none mx-0.5 select-none">/</span>
            <Link href="?lang=en" className="text-sm mt-6 -ml-1 hover:brightness-75 transition-all cursor-pointer">ENG</Link>
          </div>
          <div className="flex items-center gap-3 select-none">
            <span className="text-3xl font-semibold text-white tracking-wide">FoldUp</span>
            <img src="/image/logo.png" alt="FoldUp Logo" className="h-10 w-auto" />
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <nav className="flex bg-[#E5E5E5] border-y border-black/20 w-full mt-10">
        <Link href="/jury/eco-quest" className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer">
          Головна <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
        </Link>
        <Link href="/jury/leaderboard" className="px-10 py-4 bg-[#D9D9D9] border-r border-black/20 border-b-2 border-b-black text-lg flex items-center gap-2 font-medium cursor-pointer">
          Лідерборд <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L13 1" /></svg>
        </Link>
        <Link href="/jury/submissions" className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 cursor-pointer">
          Список робіт для оцінювання <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
        </Link>
      </nav>

      {/* ДИНАМІЧНА ТАБЛИЦЯ ЛІДЕРБОРДУ */}
      <main className="flex-1 p-10 lg:p-20 overflow-x-auto">
        <table className="w-full border-collapse border border-black min-w-[1000px]">
          <thead>
            <tr className="bg-white">
              <th className="border border-black w-48 h-16 bg-gray-50"></th>
              {criteria.map((item, idx) => (
                <th key={idx} className="border border-black p-4 text-lg font-medium text-left">
                  {item}
                </th>
              ))}
              <th className="border border-black p-4 text-xl font-bold text-left bg-gray-100">
                Загальна сума балів
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={index} className="h-12 hover:bg-gray-50 transition-colors">
                <td className="border border-black bg-[#5B73E1] text-white px-6 py-3 text-lg font-medium">
                  {team}
                </td>
                {criteria.map((_, idx) => (
                  <td key={idx} className="border border-black bg-white"></td>
                ))}
                <td className="border border-black bg-white"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#E5E5E5] py-10 border-t border-black text-center text-lg mt-auto font-inter">
        <p className="mb-4 font-medium text-xl">© 2026 FoldUp</p>
        <p className="text-gray-700 text-xl">Усі права захищено. [Політика конфіденційності] | [Умови використання] | [Контакти]</p>
      </footer>
    </div>
  );
}
