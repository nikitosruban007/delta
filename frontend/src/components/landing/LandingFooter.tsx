import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="mt-auto w-full bg-[#062e64] py-5 text-center">
      <p className="text-[15px] font-semibold italic text-[#f4a237]">
        FoldUp — Навчайся. Співпрацюй. Перемагай.
      </p>
      <p className="mt-2 text-[13px] text-white/70">
        © 2026 Усі права захищено.
      </p>
      <p className="mt-1 text-[12px] text-white/50">
        <Link href="#" className="underline-offset-2 hover:underline">[Політика конфіденційності]</Link>
        {" | "}
        <Link href="#" className="underline-offset-2 hover:underline">[Умови використання]</Link>
        {" | "}
        <Link href="#" className="underline-offset-2 hover:underline">[Контакти]</Link>
      </p>
    </footer>
  );
}
