import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function SubmissionsPage() {
  const teams = Array.from({ length: 12 }, (_, i) => `Команда ${i + 1}`);

  return (
    <div className={`min-h-screen flex flex-col bg-white text-black w-full ${inter.className}`}>
      
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-5 bg-[#1B345B] w-full">
        <Link 
          href="/jury/eco-quest" 
          className="bg-[#95BCF0] text-black px-6 py-2 rounded-md flex items-center gap-2 font-medium hover:bg-[#7ca9e6] transition-all cursor-pointer"
        >
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

      {/* CONTENT */}
      <main className="flex-1 p-12 lg:p-20">
        <h2 className="text-3xl font-medium mb-10">Загальний список команд</h2>
        
        <div className="max-w-md border border-black inline-block bg-white shadow-sm">
          {teams.map((team, index) => (
            <Link 
              key={index} 
              href={`/jury/submissions/team-${index + 1}`} 
              className={`px-12 py-4 text-xl border-black hover:bg-blue-50 cursor-pointer transition-colors block ${
                index !== teams.length - 1 ? "border-b" : ""
              }`}
            >
              {team}
            </Link>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#D9D9D9] py-10 border-t border-black text-center text-lg mt-auto">
        <p className="mb-4 font-medium text-xl">© 2026 FoldUp</p>
        <div className="text-gray-800 flex justify-center gap-1 text-xl">
          Усі права захищено. [Політика конфіденційності] | [Умови використання] | [Контакти]
        </div>
      </footer>
    </div>
  );
}
