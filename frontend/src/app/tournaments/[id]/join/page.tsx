"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Send, Trash2, UserRound, UsersRound } from "lucide-react";
import { notFound, useParams, useRouter } from "next/navigation";

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";
import { getTournamentById } from "@/lib/tournaments";

type Participant = {
  fullName: string;
  email: string;
  phone?: string;
};

const emptyParticipant = (): Participant => ({
  fullName: "",
  email: "",
  phone: "",
});

const inputClass =
  "h-10 rounded-[4px] border border-[#d0d0d2] bg-[#d7d7d9] px-4 text-sm text-[#111111] outline-none transition placeholder:text-[#343434] focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15";

export default function TournamentJoinPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tournamentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const tournament = getTournamentById(tournamentId);

  const [teamName, setTeamName] = useState("");
  const [captain, setCaptain] = useState<Participant>(emptyParticipant());
  const [participants, setParticipants] = useState<Participant[]>([emptyParticipant()]);

  if (!tournament) {
    notFound();
  }

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    setParticipants((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const addParticipant = () => {
    setParticipants((prev) => [...prev, emptyParticipant()]);
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (teamName.trim()) {
      window.sessionStorage.setItem(`${tournament.id}-team-name`, teamName.trim());
    }
    router.push(`/tournaments/${tournament.id}/submission`);
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#111111]">
      <header className="bg-[#0b3372] shadow-[0_10px_30px_rgba(11,51,114,0.18)]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href={`/tournaments/${tournament.id}`}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#d8e8ff] px-4 py-2 text-sm font-semibold text-[#0a3268] transition hover:bg-[#e6f0ff]"
          >
            <ArrowLeft className="size-4" />
            Повернутися
          </Link>

          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-3 text-sm font-medium">
              <button type="button" className="underline decoration-1 underline-offset-2">
                UKR
              </button>
              <button type="button" className="text-[#a8b8d4] transition hover:text-[#d2ddf2]">
                ENG
              </button>
            </div>
            <BrandMark />
          </div>
        </div>
      </header>

      <section className="relative isolate mx-auto w-full max-w-[1360px] flex-1 px-5 py-10 md:px-10">
        <DotGrid className="right-10 top-8 hidden opacity-60 lg:block" />
        <DotGrid className="bottom-28 left-10 hidden opacity-50 md:block" />
        <AccentDot tone="blue" className="-left-12 top-24 h-44 w-44 opacity-70" />
        <AccentDot tone="blue" className="right-4 bottom-24 h-32 w-32 opacity-65" />
        <AccentDot tone="orange" className="right-12 top-32 h-8 w-8" />
        <AccentDot tone="orange" className="left-[12%] bottom-16 h-7 w-7" />
        <AccentDot tone="red" className="right-[18%] bottom-44 h-10 w-10 opacity-90" />
        <AccentDot tone="red" className="left-[22%] top-20 h-5 w-5 opacity-80" />

        <form
          onSubmit={handleSubmit}
          className="relative z-10 overflow-hidden rounded-[8px] border border-[#7d7d7f] bg-white shadow-[0_18px_60px_rgba(17,17,17,0.08)]"
        >
          <div className="border-b border-[#d1d1d3] bg-[#f7f7f8] px-5 py-6 md:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">{tournament.shortTitle}</p>
            <h1 className="mt-2 text-3xl font-semibold">Реєстрація команди</h1>
          </div>

          <div className="space-y-8 px-5 py-8 md:px-10">
            <label className="block max-w-[360px]">
              <span className="mb-2 block text-sm font-semibold text-[#414143]">Назва команди</span>
              <input
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="Назва команди"
                className="h-12 w-full rounded-[6px] border border-[#d0d0d2] bg-[#d7d7d9] px-5 text-base outline-none transition placeholder:text-[#2e2e2e] focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                required
              />
            </label>

            <section className="overflow-hidden rounded-[8px] border border-[#d0d0d2] bg-[#fbfbfc]">
              <div className="flex items-center gap-2 bg-[#777779] px-4 py-2.5 text-sm font-medium text-white">
                <UserRound className="size-4" />
                <span>Капітан</span>
              </div>
              <div className="grid max-w-[640px] gap-3 px-4 py-4 md:px-6">
                <input
                  value={captain.fullName}
                  onChange={(event) => setCaptain((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Прізвище Ім'я"
                  className={inputClass}
                  required
                />
                <input
                  type="email"
                  value={captain.email}
                  onChange={(event) => setCaptain((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Електронна адреса"
                  className={inputClass}
                  required
                />
                <input
                  value={captain.phone}
                  onChange={(event) => setCaptain((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Номер телефону"
                  className={inputClass}
                />
              </div>
            </section>

            <div className="space-y-5">
              {participants.map((participant, index) => (
                <section key={index} className="overflow-hidden rounded-[8px] border border-[#d0d0d2] bg-[#fbfbfc]">
                  <div className="flex items-center justify-between bg-[#777779] px-4 py-2.5 text-sm font-medium text-white">
                    <span className="inline-flex items-center gap-2">
                      <UsersRound className="size-4" />
                      {index === 0 ? "Учасник_1" : `Учасник_${index + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      disabled={participants.length === 1}
                      className="inline-flex items-center gap-1 transition hover:text-[#d8e8ff] disabled:opacity-60"
                    >
                      <Trash2 className="size-3.5" />
                      Видалити
                    </button>
                  </div>
                  <div className="grid max-w-[640px] gap-3 px-4 py-4 md:px-6">
                    <input
                      value={participant.fullName}
                      onChange={(event) => handleParticipantChange(index, "fullName", event.target.value)}
                      placeholder="Прізвище Ім'я"
                      className={inputClass}
                      required
                    />
                    <input
                      type="email"
                      value={participant.email}
                      onChange={(event) => handleParticipantChange(index, "email", event.target.value)}
                      placeholder="Електронна адреса"
                      className={inputClass}
                      required
                    />
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-5 border-t border-[#8e8e8e] bg-[#eeeeef] px-6 py-7 sm:flex-row sm:gap-10">
            <button
              type="button"
              onClick={addParticipant}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#5f72df] bg-white px-6 py-2.5 text-xl font-medium leading-none text-[#0a1f55] transition hover:bg-[#f0f4ff] md:text-[24px]"
            >
              <Plus className="size-5" />
              Додати учасника +
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#5f72df] px-7 py-2.5 text-xl font-medium leading-none text-[#0a1f55] shadow-[0_12px_24px_rgba(95,114,223,0.24)] transition hover:bg-[#5366d5] md:text-[24px]"
            >
              <Send className="size-5" />
              Зареєструвати команду
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}
