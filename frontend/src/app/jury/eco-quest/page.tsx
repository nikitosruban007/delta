import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

// Підключаємо шрифт Inter
const inter = Inter({ subsets: ["latin", "cyrillic"] });

export default function JuryEcoQuestPage() {
  return (
    <div className={`min-h-screen flex flex-col bg-white text-black w-full ${inter.className}`}>
      
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-5 bg-[#1B345B] w-full">
        <Link 
          href="/jury" 
          className="bg-[#95BCF0] text-black px-6 py-2 rounded-md flex items-center gap-2 font-medium hover:bg-[#7ca9e6] transition-all cursor-pointer"
        >
          <span>←</span> Повернутися
        </Link>
        
        <div className="flex items-center gap-8">
          {/* ПЕРЕМИКАЧ МОВ - Клікабельні UKR та ENG окремо */}
          {/* ПЕРЕМИКАЧ МОВ - Ефект збільшення замість прозорості */}
          <div className="flex items-center font-medium tracking-wide bg-gradient-to-r from-[#F91B1B] to-[#EB9626] bg-clip-text text-transparent">
            <Link 
              href="/jury/eco-quest?lang=uk" 
              className="text-sm mb-5 -mr-1 hover:scale-110 transition-transform duration-200 cursor-pointer origin-bottom-right"
            >
              UKR
            </Link>
            
            <span className="text-[42px] font-light italic leading-none mx-0.5 select-none">/</span>
            
            <Link 
              href="/jury/eco-quest?lang=en" 
              className="text-sm mt-6 -ml-1 hover:scale-110 transition-transform duration-200 cursor-pointer origin-top-left"
            >
              ENG
            </Link>
          </div>
          
          <div className="flex items-center gap-3 select-none">
            <span className="text-3xl font-semibold text-white tracking-wide">FoldUp</span>
            <img src="/image/logo.png" alt="FoldUp Logo" className="h-10 w-auto" />
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION - Всі вкладки клікабельні */}
      <nav className="flex bg-[#E5E5E5] border-y border-black/20 w-full mt-10">
        <Link 
          href="/jury/eco-quest" 
          className="px-10 py-4 bg-[#D9D9D9] border-r border-black/20 border-b-2 border-b-black text-lg flex items-center gap-2 font-medium cursor-pointer"
        >
          Головна
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L13 1" /></svg>
        </Link>
        <Link 
          href="/jury/leaderboard" 
          className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Лідерборд
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
        </Link>
        <Link 
          href="/jury/submissions" 
          className="px-10 py-4 border-r border-black/20 text-gray-800 text-lg flex items-center gap-2 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Список робіт для оцінювання
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1L7 7L1 13" /></svg>
        </Link>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col lg:flex-row w-full border-b border-black/20">
        {/* Left Side */}
        <div className="flex-1 bg-[#D9D9D9] p-12 lg:p-16">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight mb-10">
            CODE & PLAY: ECO-QUEST
          </h1>
          <div className="text-xl leading-relaxed space-y-6 max-w-3xl">
            <p>
              Суть завдання: Командам необхідно за 48 годин розробити прототип браузерної міні-гри на тему екології та сталого розвитку.
            </p>
            <ul className="list-disc pl-6 space-y-6">
              <li>Мета гри: Навчити гравця сортувати сміття або керувати енергією віртуального міста.</li>
              <li>Головна умова: Кожен член команди має відповідати за окрему частину: один за логіку (Backend), другий за візуал (Frontend/UI), третій за контент та правила (Game Design).</li>
            </ul>
          </div>
        </div>

        {/* Right Side (Stats) */}
        <div className="w-full lg:w-[450px] bg-[#95BCF0] p-12 lg:p-16 flex flex-col">
          <h2 className="text-2xl font-medium mb-12">Головна інформація</h2>
          
          <div className="space-y-6 text-lg flex-1">
            <div className="flex justify-between border-b border-black pb-1">
              <span>Учасників в одній команді:</span>
              <span className="font-medium">3-5</span>
            </div>
            <div className="flex justify-between border-b border-black pb-1">
              <span>Кількість команд:</span>
              <span className="font-medium">50</span>
            </div>
            <div className="flex justify-between border-b border-black pb-1 italic">
              <span>Доступна кількість місць:</span>
              <span className="font-medium not-italic">12</span>
            </div>
            <div className="flex justify-between border-b border-black pb-1 italic mt-8">
              <span>Кількість раундів:</span>
              <span className="font-medium not-italic">2</span>
            </div>
          </div>

          {/* КЛІКАБЕЛЬНІ ХЕШТЕГИ */}
          <div className="mt-16 text-right text-sm italic font-medium space-y-1 text-black/80">
            <div className="flex gap-2 justify-end">
              <Link href="/tags/48hours" className="hover:text-black hover:underline cursor-pointer">#48hours</Link>
              <Link href="/tags/gamedev" className="hover:text-black hover:underline cursor-pointer">#GamedevLearning</Link>
              <Link href="/tags/greentech" className="hover:text-black hover:underline cursor-pointer">#GreenTechPlay</Link>
            </div>
            <Link href="/tags/team" className="hover:text-black hover:underline cursor-pointer block">#КоманднийКод</Link>
          </div>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="py-20 px-8 w-full">
        <h2 className="text-4xl text-center mb-12">
          <span className="italic">Timeline турніру</span> Code & Play: Eco-Quest
        </h2>
        <div className="max-w-5xl mx-auto space-y-5 text-xl">
          <div className="bg-[#E5E5E5] px-8 py-4">Кінець реєстрації</div>
          <div className="bg-[#E5E5E5] px-8 py-4 italic">Початок турніру</div>
          <div className="bg-[#E5E5E5] px-8 py-4">Закінчення першого раунду</div>
          <div className="bg-[#E5E5E5] px-8 py-4">Закінчення другого раунду</div>
          <div className="bg-[#E5E5E5] px-8 py-4 italic">Початок перевірки - Кінець перевірки</div>
          <div className="bg-[#E5E5E5] px-8 py-4">Оголошення результатів</div>
        </div>
      </section>

      {/* EVALUATION CRITERIA SECTION */}
      <section className="pb-24 px-8 w-full">
        <div className="border border-black p-12 lg:p-16 max-w-5xl mx-auto">
          <h3 className="text-3xl text-[#EB9626] text-center mb-10 font-medium">
            Критерії оцінювання:
          </h3>
          <div className="space-y-10 text-2xl">
            <div>
              <h4 className="mb-4">I. Технічна частина</h4>
              <ul className="list-disc pl-8 space-y-2">
                <li>Backend якість коду (clean code, патерни, ООП, відсутність помилок, тести)</li>
                <li>Database (наявність/налаштування, структура)</li>
                <li>Frontend (clean code, патерни, відсутність помилок, UX/UI, тести)</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">II. Функціональність</h4>
              <ul className="list-disc pl-8 space-y-2">
                <li>Виконання вимог завдання (“must have”)</li>
                <li>Роботоздатність, відсутність багів</li>
                <li>Зручність використання</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#E5E5E5] py-10 border-t border-black text-center text-lg mt-auto">
        <p className="mb-4 font-medium">© 2026 FoldUp</p>
        <p className="text-gray-700">
          Усі права захищено. [Політика конфіденційності] | [Умови використання] | [Контакти]
        </p>
      </footer>
    </div>
  );
}