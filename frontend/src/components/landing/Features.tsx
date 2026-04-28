import Image from "next/image";

export default function Features() {
  return (
    <section className="relative mx-auto w-full max-w-[1200px] space-y-12 overflow-hidden px-5 py-12 md:px-8 md:py-16">
      <div className="pointer-events-none absolute -right-20 top-[235px] h-56 w-40 rounded-full bg-[#ef8a1e] opacity-75 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-[640px] h-52 w-52 rounded-full bg-[#4f7fd8] opacity-70 blur-3xl" />

      <div className="grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
        <div className="max-w-[760px] space-y-4 text-[18px] leading-[1.34] text-[#1f1f1f] max-md:text-[22px]">
          <p>FoldUp — це інноваційна платформа для командних змагань, де навчання перетворюється на захопливий квест.</p>
          <p>Ми стираємо кордони між теорією та практикою, допомагаючи кожному знайти своє місце в цифровій спільноті однодумців.</p>
        </div>
        <Image
          src="/image/problem.png"
          alt="Група людей"
          width={250}
          height={250}
          className="mx-auto w-[210px] rounded-sm md:w-[250px]"
        />
      </div>

      <div id="audience" className="space-y-4">
        <h2 className="text-[50px] font-semibold text-black max-md:text-[34px]">Для кого цей застосунок?</h2>
        <div className="overflow-hidden rounded-[20px] bg-[#dcdadb] md:grid md:grid-cols-[320px_1fr]">
          <Image src="/image/hands.png" alt="Для кого" width={320} height={360} className="h-full w-full object-cover" />
          <div className="p-5 text-[18px] leading-7 text-[#1f1f1f] md:p-8">
            <p className="mb-3">
              Ми створили простір, де цифровізація служить людям, а не навпаки. Наша платформа — це міст між поколіннями та ролями:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Для учнів та студентів: можливість прокачати soft skills, навчитися працювати в команді та розв&apos;язувати реальні кейси у форматі гри.</li>
              <li>Для вчителів та менторів: зручний інструмент для організації турнірів, автоматизації оцінювання та відстеження прогресу.</li>
              <li>Для однодумців: завдяки цифровим інструментам ви швидко знаходите партнерів для проєктів, обмінюєтеся досвідом та створюєте спільні продукти.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[50px] font-semibold text-black max-md:text-[34px]">Наші досягнення та шлях</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Image src="/image/achiv1.png" alt="Досягнення 1" width={560} height={180} className="h-full w-full object-cover" />
          <div className="relative">
            <Image src="/image/achiv2.png" alt="Досягнення 2" width={560} height={180} className="h-full w-full object-cover" />
            <Image src="/image/arrow.png" alt="" width={44} height={50} className="pointer-events-none absolute bottom-2 right-3" />
          </div>
        </div>
        <div className="overflow-hidden rounded-[20px] bg-[#d9d8d8] md:grid md:grid-cols-[1fr_270px]">
          <div className="p-5 text-[18px] leading-7 text-[#1f1f1f] md:p-8">
            <p className="mb-3">Ми трансформуємо процес навчання, перетворюючи його на результативну командну гру:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Ефективність: Завдяки цифровізації ми об&apos;єднуємо сотні однодумців, забезпечуючи прозоре оцінювання та високу залученість.</li>
              <li>Технологічність: Платформа побудована на сучасній архітектурі, що гарантує стабільність від пілотних навчань до запуску в різних регіонах.</li>
              <li>Майбутнє: Ми масштабуємо систему, впроваджуючи нові інструменти для аналітики успішності та тіснішої взаємодії між командами.</li>
            </ul>
          </div>
          <Image src="/image/office.png" alt="Офіс команди" width={270} height={330} className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}