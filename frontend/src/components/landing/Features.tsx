import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { DotGrid } from "@/components/shared/Decor";
import { assets } from "@/lib/assets";

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <Image src={assets.mark} alt="" width={32} height={24} className={`h-6 w-auto ${className}`} />
  );
}

export default function Features() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1160px] space-y-12 px-5 py-14 md:px-8 md:py-18">
        <DotGrid className="left-6 top-10 opacity-50 md:left-12" />

        <div className="grid gap-8 md:grid-cols-[1fr_220px] md:items-center">
          <div className="space-y-4 text-base leading-7 text-[#061733] md:text-lg">
            <p>
              FoldUp — це інноваційна платформа для командних змагань, де навчання перетворюється на захопливий квест.
            </p>
            <p>
              Ми стираємо кордони між теорією та практикою, допомагаючи кожному знайти своє місце в цифровій спільноті однодумців.
            </p>
          </div>
          <Image
            src={assets.landing.problem}
            alt="Команда презентує ідеї"
            width={220}
            height={152}
            className="mx-auto w-[180px] rounded-[8px] shadow-[0_18px_42px_rgba(18,54,103,0.1)] md:w-[220px]"
          />
        </div>

        <div id="audience" className="space-y-5">
          <h2 className="flex items-center gap-3 text-[34px] font-black leading-tight text-[#061733] md:text-[48px]">
            <StarIcon /> Для кого цей застосунок?
          </h2>
          <div className="overflow-hidden rounded-[16px] border border-[#dce4f0] bg-white shadow-[0_18px_60px_rgba(18,54,103,0.08)] md:grid md:grid-cols-[300px_1fr]">
            <Image src={assets.landing.hands} alt="Спільна командна робота" width={346} height={438} className="h-full max-h-[330px] w-full object-cover md:max-h-none" />
            <div className="bg-[#eef1f6] p-5 text-base leading-7 text-[#061733] md:p-8">
              <p className="mb-4">
                Ми створили простір, де цифровізація служить людям, а не навпаки. Наша платформа — це міст між поколіннями та ролями:
              </p>
              <ul className="list-disc space-y-3 pl-5">
                <li><strong>Для учнів та студентів:</strong> Можливість прокачати «soft skills», навчитися працювати в команді та розв&apos;язувати реальні кейси у форматі гри. Це не просто навчання — це пошук друзів та професійне зростання незалежно від віку.</li>
                <li><strong>Для вчителів та менторів:</strong> Зручний інструмент для організації турнірів, автоматизації оцінювання та відстеження прогресу. Ми даємо можливість навчати цікаво, використовуючи сучасний UX/UI підхід.</li>
                <li><strong>Для однодумців:</strong> Завдяки цифровим інструментам ви миттєво знаходите партнерів для проєктів, обмінюєтеся досвідом та створюєте спільні продукти.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="flex items-center gap-3 text-[34px] font-black leading-tight text-[#061733] md:text-[48px]">
            <StarIcon /> Наші досягнення та шлях
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Image src={assets.landing.achiv1} alt="Команда на зустрічі" width={624} height={245} className="h-full min-h-[170px] w-full rounded-[8px] object-cover shadow-[0_14px_34px_rgba(18,54,103,0.08)]" />
            <div className="relative">
              <Image src={assets.landing.achiv2} alt="Учасники освітнього заходу" width={624} height={245} className="h-full min-h-[170px] w-full rounded-[8px] object-cover shadow-[0_14px_34px_rgba(18,54,103,0.08)]" />
              <Image src={assets.landing.arrow} alt="" width={44} height={50} className="pointer-events-none absolute bottom-3 right-3" />
            </div>
          </div>

          <div className="overflow-hidden rounded-[16px] border border-[#dce4f0] bg-[#eef1f6] shadow-[0_18px_60px_rgba(18,54,103,0.08)] md:grid md:grid-cols-[1fr_270px]">
            <div className="p-5 text-base leading-7 text-[#061733] md:p-8">
              <p className="mb-4">Ми трансформуємо процес навчання, перетворюючи його на результативну командну гру:</p>
              <ul className="list-disc space-y-3 pl-5">
                <li><strong>Ефективність:</strong> Завдяки цифровізації ми об&apos;єднуємо сотні однодумців, забезпечуючи прозоре оцінювання та високу залученість учасників.</li>
                <li><strong>Технологічність:</strong> Платформа побудована на сучасній архітектурі, що гарантує стабільність під час пікових навантажень та зручність у роботі з дедлайнами.</li>
                <li><strong>Майбутнє:</strong> Ми масштабуємо систему, впроваджуючи нові інструменти для аналітики успішності та ще тіснішої взаємодії між командами.</li>
              </ul>
            </div>
            <Image src={assets.landing.office} alt="Команда в офісі" width={340} height={438} className="h-full max-h-[320px] w-full object-cover md:max-h-none" />
          </div>
        </div>

        {/* Зацікавило? CTA block */}
        <div className="text-center">
          <h2 className="text-[36px] font-black text-[#061733] md:text-[42px]">Зацікавило?</h2>
          <p className="mt-2 text-lg text-[#526079]">Знаходь однодумців та команду</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5">
            <Link href="/dashboard" className="rounded-[16px] bg-[#ff9812] px-8 py-3 text-[15px] font-bold text-white shadow-[0_18px_36px_rgba(255,152,18,0.28)] transition hover:bg-[#ef8700]">
              Знайти турнір
            </Link>
            <Link href="/register" className="rounded-[16px] bg-[#f2474e] px-8 py-3 text-[15px] font-bold text-white shadow-[0_18px_36px_rgba(242,71,78,0.24)] transition hover:bg-[#df3941]">
              Зареєструватися
            </Link>
          </div>
        </div>

        <div id="contacts" className="rounded-[18px] border border-[#dce4f0] bg-white p-6 shadow-[0_18px_50px_rgba(18,54,103,0.08)] md:grid md:grid-cols-[1fr_1.2fr] md:items-center md:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1f62df]">
              <Phone className="size-11" />
            </div>
            <div>
              <h2 className="text-[28px] font-black text-[#061733] md:text-[34px]">Контактна інформація</h2>
              <p className="mt-3 text-lg leading-7 text-[#526079]">Зв&apos;яжіться з адміністрацією, якщо виникнуть питання:</p>
            </div>
          </div>
          <div className="mt-8 space-y-4 border-[#d8e0ed] md:mt-0 md:border-l md:pl-10">
            <p className="flex items-center gap-4 break-words text-lg text-[#061733]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#1f62df]">
                <Mail className="size-6" />
              </span>
              delta.group404@gmail.com
            </p>
            <p className="flex items-center gap-4 text-lg text-[#061733]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#1f62df]">
                <Phone className="size-6" />
              </span>
              398-288-4208 ×609
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
