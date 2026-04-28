import Link from "next/link";

export default function ProfileSetupPage() {
  return (
    <main className="relative min-h-screen bg-[#efefef]">
      <section className="mx-auto w-full max-w-[1200px] px-6 pt-24">
        <p className="max-w-[760px] text-[33px] leading-[1.24] text-[#202020]">
          Користувач заповнює дані для свого акаунту, а також вказує свої навички, підтвердження особи студента, або ж учня (дата народження)
        </p>
        <p className="mt-16 text-[39px] text-[#222]">Share ID</p>
      </section>

      <div className="absolute bottom-20 right-24">
        <Link
          href="/dashboard"
          className="inline-block min-w-[370px] rounded-2xl bg-[#5b6fdf] px-8 py-3 text-center text-[50px] text-[#111f4f] transition hover:bg-[#6a7de5]"
        >
          Пропустити
        </Link>
      </div>
    </main>
  );
}
