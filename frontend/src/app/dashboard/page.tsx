import Image from "next/image";

function ActiveTournamentCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-[#cfcfcf] bg-[#d9d9d9] shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="border-b border-[#b9d95a] bg-[#c6ea5e] px-5 py-3 text-[14px] font-semibold text-[#1f1f1f] underline">Назва турніру</div>
      <div className="p-5">
        <p className="max-w-[280px] text-[11px] leading-snug text-[#2a2a2a]">
          Коротко опис турніру, його
          <br />
          мета...........................................
          <br />
          ....................................................
        </p>
        <p className="mt-4 text-right text-[10px] text-[#3a3a3a]">#Список шостий</p>
        <div className="mt-1 text-right">
          <button
            type="button"
            className="cursor-pointer rounded-full bg-[#5f72df] px-5 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#5264ce]"
          >
            Перейти до турніру
            <span className="ml-2" aria-hidden>
              →
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

function GridTournamentCard() {
  return (
    <article className="flex h-[185px] flex-col justify-between rounded-xl border border-[#cfcfcf] bg-[#d9d9d9] p-6">
      <div>
        <h3 className="text-[14px] font-medium text-[#252525] underline">Назва турніру</h3>
        <p className="mt-3 max-w-[240px] text-[11px] leading-tight text-[#2a2a2a]">Коротко опис турніру, які будуть завдання та критерії</p>
      </div>
      <div className="text-right">
        <button
          type="button"
          className="cursor-pointer rounded-full bg-[#5f72df] px-5 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-[#5264ce]"
        >
          Дізнатися більше
          <span className="ml-2" aria-hidden>
            →
          </span>
        </button>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const userEmail = "delta.group404@gmail.com";

  return (
    <main className="min-h-screen bg-[#efefef] text-[#161616]">
      <section className="mx-auto max-w-[1280px] border-x border-b border-[#232323] bg-[#efefef]">
        <div className="grid grid-cols-[205px_1fr]">
          <aside className="border-r border-[#2a2a2a] bg-[#d7d7d7] px-4 py-5">
            <div className="mb-5 flex items-start justify-between">
              <div className="mx-auto mt-1 h-20 w-20 rounded-full bg-[#6a6a6a]" />
              <button type="button" className="mt-1 cursor-pointer">
                <Image src="/image/settings.png" alt="Налаштування" width={14} height={14} />
              </button>
            </div>
            <p className="text-center text-[17px] leading-tight">Ім&apos;я</p>
            <p className="mb-4 text-center text-[17px] leading-tight">Прізвище</p>

            <nav className="border-t border-[#bcbcbc] pt-3 text-[12px] leading-tight text-[#202020]">
              <p>Роль: учасник</p>
              <p className="mt-2">Опис про себе......................................</p>
              <p className="mt-2.5 break-words">Електронна адреса: {userEmail}</p>
              <button type="button" className="mt-4 cursor-pointer text-[11px] text-[#666] transition-colors hover:text-[#525252]">
                Архів турнірів →
              </button>
            </nav>
          </aside>

          <div className="px-7 py-7">
            <h1 className="mb-5 text-[47px] font-semibold">Твої активні турніри</h1>
            <div className="grid grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, idx) => (
                <ActiveTournamentCard key={idx} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] border-x border-b border-[#232323] bg-[#efefef]">
        <div className="flex items-center justify-between px-16 py-3 text-[16px]">
          <button type="button" className="flex cursor-pointer items-center gap-2 text-[#1f1f1f] transition-colors hover:text-black">
            МАЙБУТНІ ТУРНІРИ <span className="inline-block text-[16px] leading-[1.15]">∨</span>
          </button>
          <button type="button" className="flex cursor-pointer items-center gap-2 text-[#1f1f1f] transition-colors hover:text-black">
            РЕЄСТРАЦІЯ <span className="inline-block text-[16px] leading-[1.15]">∨</span>
          </button>
          <button type="button" className="flex cursor-pointer items-center gap-2 text-[#1f1f1f] transition-colors hover:text-black">
            ПОТОЧНІ ТУРНІРИ <span className="inline-block text-[16px] leading-[1.15]">∨</span>
          </button>
          <button type="button" className="flex cursor-pointer items-center gap-2 text-[#1f1f1f] transition-colors hover:text-black">
            ЗАКІНЧЕНІ <span className="inline-block text-[16px] leading-[1.15]">∨</span>
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-[#d0d0d0] bg-white px-4 py-1.5">
            <input
              type="text"
              placeholder="Пошук..."
              className="w-[84px] bg-transparent text-[12px] text-[#717171] outline-none placeholder:text-[#717171]"
              aria-label="Пошук"
            />
            <span aria-hidden className="text-[12px] text-[#717171]">
              ⌕
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] border-x border-[#232323] bg-[#efefef] px-16 py-10">
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, idx) => (
            <GridTournamentCard key={idx} />
          ))}
        </div>
      </section>

      <section className="mx-auto mb-8 max-w-[1280px] border-x border-y border-[#232323] bg-[#dcdcdc] px-16 py-9">
        <h2 className="mb-6 text-[17px] font-semibold">Архів турнірів</h2>
        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <GridTournamentCard key={`archive-${idx}`} />
          ))}
        </div>
      </section>
    </main>
  );
}
