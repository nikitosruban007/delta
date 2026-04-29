import Image from "next/image";

export default function Footer() {
  return (
    <footer id="contacts" className="w-full pt-2">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-6 px-5 py-12 md:flex-row md:px-8">
        <div className="text-center md:text-left">
          <h3 className="-rotate-6 text-[50px] font-medium leading-none text-black max-md:text-[38px]">Зацікавило?</h3>
          <p className="-mt-1 text-[20px] text-black max-md:text-[21px]">Знаходь однодумців та команду</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <button className="rounded-2xl bg-[#eb9626] px-8 py-3 text-[18px] font-medium text-white transition hover:bg-[#d98921]">
            Знайти турнір
          </button>
          <button className="rounded-2xl bg-[#e64848] px-8 py-3 text-[18px] font-medium text-white transition hover:bg-[#d43c3c]">
            Зареєструватися
          </button>
        </div>
      </div>

      <div className="w-full border-y border-[#4a6d9f] bg-[#80a8dc]">
        <div className="mx-auto grid w-full max-w-[1200px] gap-4 px-5 py-7 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-[44px] font-semibold leading-tight text-[#0e2748] max-md:text-[35px]">Контактна інформація</p>
            <p className="text-[18px] leading-tight text-[#0e2748] max-md:text-[24px]">Зв&apos;яжіться з адміністрацією, якщо виникнуть питання:</p>
          </div>
          <div className="space-y-2 text-[25px] text-[#1b3960] max-md:text-[31px]">
            <p className="flex items-center gap-3">
              <Image src="/image/email_icon.png" alt="Email" width={28} height={28} />
              delta.group404@gmail.com
            </p>
            <p className="flex items-center gap-3">
              <Image src="/image/phone_icon.png" alt="Телефон" width={28} height={28} />
              398-288-4208 x609
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#efeeea] px-5 py-10 text-center text-[#363636] md:px-8">
        <p className="text-[24px] font-medium leading-tight max-md:text-[34px]">EduTeam Connect — Навчайся. Співпрацюй. Перемагай.</p>
        <p className="mt-4 text-[24px] leading-tight max-md:text-[34px]">© 2026 Усі права захищено.</p>
        <p className="mt-5 text-[19px] leading-tight max-md:text-[30px]">
          [Політика конфіденційності] [Умови використання] [Контакти]
          <br />
          Розроблено з думкою про майбутнє освіти.
        </p>
      </div>
    </footer>
  );
}