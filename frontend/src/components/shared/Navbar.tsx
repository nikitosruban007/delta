import Link from "next/link";

import BrandMark from "./BrandMark";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#062e64] shadow-[0_12px_32px_rgba(5,28,64,0.18)]">
      <div className="mx-auto flex min-h-[78px] w-full max-w-[1440px] items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 md:min-h-[92px] md:px-12 lg:pl-28 lg:pr-8 xl:pl-36 xl:pr-10">
        <BrandMark />

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-5 lg:gap-6">
          <div className="flex items-center gap-3 text-[13px] font-bold sm:gap-4 sm:text-[15px] md:text-[17px]">
            {/* TODO: Додати логіку перемикання мови тут, коли буде готова локалізація. */}
            <button
              type="button"
              aria-pressed="true"
              className="text-white transition hover:text-[#dce9ff]"
            >
              UKR
            </button>
            <button
              type="button"
              aria-pressed="false"
              className="text-[#93a6c4] transition hover:text-[#d4e2f7]"
            >
              ENG
            </button>
          </div>
          <Link
            href="/login"
            className="hidden rounded-[15px] border border-[#8bbdff] px-6 py-3 text-[17px] font-semibold text-[#e7f2ff] transition hover:bg-[#164984] md:inline-flex"
          >
            Увійти
          </Link>
          <Link
            href="/register"
            className="rounded-[13px] bg-[#9ec8ff] px-4 py-2.5 text-[15px] font-semibold text-[#0a3268] shadow-[0_10px_24px_rgba(116,173,251,0.28)] transition hover:bg-[#b7d8ff] md:rounded-[15px] md:px-7 md:py-3 md:text-[17px]"
          >
            Почати <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
