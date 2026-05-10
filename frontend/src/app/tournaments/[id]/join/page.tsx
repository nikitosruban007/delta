"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Send, Trash2, UserRound, UsersRound } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";
import { useAuth } from "@/contexts/auth-context";
import { teamsApi, tournamentsApi, ApiError } from "@/lib/api";

type Participant = { fullName: string; email: string };
const emptyParticipant = (): Participant => ({ fullName: "", email: "" });

const inputClass =
  "h-10 rounded-[4px] border border-[#d0d0d2] bg-[#d7d7d9] px-4 text-sm text-[#111111] outline-none transition placeholder:text-[#343434] focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15";

export default function TournamentJoinPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tournamentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { token, isAuthenticated } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([emptyParticipant()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => tournamentsApi.getById(tournamentId),
  });

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    setParticipants((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addParticipant = () => setParticipants((prev) => [...prev, emptyParticipant()]);
  const removeParticipant = (index: number) =>
    setParticipants((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    if (!teamName.trim()) {
      setServerError("Введіть назву команди");
      return;
    }

    setIsSubmitting(true);
    try {
      await teamsApi.register({ tournamentId, name: teamName.trim() }, token);
      router.push(`/tournaments/${tournamentId}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(
          error.status === 409
            ? "Ви вже зареєстрували команду на цей турнір"
            : error.message,
        );
      } else {
        setServerError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f6]">
        <Loader2 className="size-10 animate-spin text-[#5f72df]" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#111111]">
      <header className="bg-[#0b3372] shadow-[0_10px_30px_rgba(11,51,114,0.18)]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#d8e8ff] px-4 py-2 text-sm font-semibold text-[#0a3268] transition hover:bg-[#e6f0ff]"
          >
            <ArrowLeft className="size-4" />
            Повернутися
          </Link>
          <div className="flex items-center gap-6 text-white">
            <BrandMark />
          </div>
        </div>
      </header>

      <section className="relative isolate mx-auto w-full max-w-[1360px] flex-1 px-5 py-10 md:px-10">
        <DotGrid className="right-10 top-8 hidden opacity-60 lg:block" />
        <AccentDot tone="blue" className="-left-12 top-24 h-44 w-44 opacity-70" />
        <AccentDot tone="orange" className="right-12 top-32 h-8 w-8" />

        <form
          onSubmit={handleSubmit}
          className="relative z-10 overflow-hidden rounded-[8px] border border-[#7d7d7f] bg-white shadow-[0_18px_60px_rgba(17,17,17,0.08)]"
        >
          <div className="border-b border-[#d1d1d3] bg-[#f7f7f8] px-5 py-6 md:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">
              {tournament?.title ?? "Турнір"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Реєстрація команди</h1>
          </div>

          <div className="space-y-8 px-5 py-8 md:px-10">
            {serverError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</p>
            )}

            {!isAuthenticated && (
              <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                Для реєстрації команди потрібно{" "}
                <Link href="/login" className="underline font-medium">увійти в акаунт</Link>.
              </p>
            )}

            <label className="block max-w-[360px]">
              <span className="mb-2 block text-sm font-semibold text-[#414143]">Назва команди</span>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Назва команди"
                className="h-12 w-full rounded-[6px] border border-[#d0d0d2] bg-[#d7d7d9] px-5 text-base outline-none transition placeholder:text-[#2e2e2e] focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                required
              />
            </label>

            <div className="space-y-5">
              {participants.map((participant, index) => (
                <section
                  key={index}
                  className="overflow-hidden rounded-[8px] border border-[#d0d0d2] bg-[#fbfbfc]"
                >
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
                      onChange={(e) => handleParticipantChange(index, "fullName", e.target.value)}
                      placeholder="Прізвище Ім'я"
                      className={inputClass}
                    />
                    <input
                      type="email"
                      value={participant.email}
                      onChange={(e) => handleParticipantChange(index, "email", e.target.value)}
                      placeholder="Електронна адреса"
                      className={inputClass}
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
              disabled={isSubmitting || !isAuthenticated}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#5f72df] px-7 py-2.5 text-xl font-medium leading-none text-[#0a1f55] shadow-[0_12px_24px_rgba(95,114,223,0.24)] transition hover:bg-[#5366d5] disabled:opacity-60 md:text-[24px]"
            >
              {isSubmitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
              {isSubmitting ? "Реєструємо..." : "Зареєструвати команду"}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}
