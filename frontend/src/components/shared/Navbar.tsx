import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Про нас", href: "#about" },
  { label: "Для кого?", href: "#audience" },
  { label: "Контакти", href: "#contacts" },
];

export default function Navbar() {
  return (
    <header className="z-30 w-full border-b border-slate-800 bg-[#143973]">
      <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="text-[38px] leading-none max-md:text-[30px]">FoldUp</span>
          <Image src="/image/orange_icon.png" alt="FoldUp icon" width={40} height={40} />
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] text-[#dde6fa] lg:flex">
          {links.map((link) => (
            <a key={link.label} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 text-[14px] lg:flex">
            <button className="text-[#f3c234]">UKR</button>
            <span className="text-red-500">/</span>
            <button className="text-red-500">ENG</button>
          </div>
          <Link
            href="/login"
            className="rounded-xl border border-[#8cb2e8] px-4 py-2 text-[14px] text-[#d6e7ff] transition hover:bg-[#1c4c95] max-md:hidden"
          >
            Увійти
          </Link>
          <Link href="/register" className="rounded-xl bg-[#84b6f5] px-4 py-2 text-[14px] text-[#0f2d58] transition hover:bg-[#9ec5f8]">
            Почати <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}