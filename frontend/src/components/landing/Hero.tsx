export default function Hero() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-b border-[#c8d6ee] bg-[#e8edf8]"
      style={{
        backgroundImage: "url('/image/group.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative mx-auto min-h-[370px] w-full max-w-[1200px] px-5 py-12 md:px-8">
        <div className="relative z-10 mt-16 max-w-[760px] pl-14 max-md:pl-10">
          <h1 className="text-[52px] font-bold tracking-wide text-black max-md:text-[42px]">FOLDUP</h1>
          <p className="mt-1 text-[20px] leading-tight text-[#323232] max-md:text-[18px]">
            Об&apos;єднуємо інтелект, будуємо майбутнє разом.
          </p>
          <button className="mt-5 rounded-lg bg-[#eb9626] px-6 py-2 text-[15px] font-semibold text-white transition hover:bg-[#d98921]">
            Знайти турнір
          </button>
        </div>
      </div>
    </section>
  );
}