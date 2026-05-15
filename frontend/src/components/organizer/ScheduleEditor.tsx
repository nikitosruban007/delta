"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, MapPin, Plus, Trash2 } from "lucide-react";

import { scheduleApi, tournamentsApi, type TournamentEvent } from "@/lib/api";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // datetime-local: yyyy-MM-ddTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function ScheduleEditor({
  tournamentId,
  token,
}: {
  tournamentId: string;
  token: string;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [roundId, setRoundId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["schedule-tournament", tournamentId],
    queryFn: () => scheduleApi.listForTournament(tournamentId, token),
    enabled: Boolean(token),
  });

  const { data: rounds = [] } = useQuery({
    queryKey: ["tournament-rounds", tournamentId],
    queryFn: () => tournamentsApi.getRounds(tournamentId, token),
    enabled: Boolean(token),
  });

  const reset = () => {
    setTitle("");
    setDescription("");
    setStartsAt("");
    setEndsAt("");
    setLocation("");
    setRoundId("");
    setError(null);
  };

  const createMutation = useMutation({
    mutationFn: () => {
      if (!title.trim()) throw new Error("Назва події обовʼязкова");
      const startsIso = fromInput(startsAt);
      if (!startsIso) throw new Error("Вкажіть коректний час початку");
      const endsIso = endsAt ? fromInput(endsAt) : undefined;
      return scheduleApi.create(
        tournamentId,
        {
          title: title.trim(),
          description: description.trim() || undefined,
          startsAt: startsIso,
          endsAt: endsIso ?? undefined,
          location: location.trim() || undefined,
          roundId: roundId ? Number(roundId) : undefined,
        },
        token,
      );
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["schedule-tournament", tournamentId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (eventId: string) => scheduleApi.remove(eventId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-tournament", tournamentId] });
    },
  });

  return (
    <section className="rounded-[12px] border border-[#dadce5] bg-[#fafbff] p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-2">
        <CalendarDays className="size-5 text-[#1B345B]" />
        <h3 className="text-lg font-semibold text-[#111]">Розклад подій</h3>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-6 animate-spin text-[#5f72df]" />
        </div>
      ) : events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#cbd1e2] bg-white px-4 py-6 text-center text-sm text-[#5b5f69]">
          Ще немає подій. Додайте першу нижче.
        </p>
      ) : (
        <div className="space-y-2">
          {events.map((e: TournamentEvent) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-[#e6e8ef] bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[#111]">{e.title}</p>
                  {e.round && (
                    <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#9a3412]">
                      {e.round.title}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#5b5f69]">
                  {fmt(e.startsAt)}
                  {e.endsAt ? ` – ${fmt(e.endsAt)}` : ""}
                </p>
                {e.location && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#888]">
                    <MapPin className="size-3" />
                    {e.location}
                  </p>
                )}
                {e.description && (
                  <p className="mt-1 text-xs text-[#5b5f69]">{e.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Видалити подію "${e.title}"?`)) removeMutation.mutate(e.id);
                }}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#a0263c] transition hover:bg-red-50"
              >
                <Trash2 className="size-3.5" />
                Видалити
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-lg border border-[#c7c9d1] bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-[#111]">Додати подію</p>
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Назва події"
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df]"
          />
          <select
            value={roundId}
            onChange={(e) => setRoundId(e.target.value)}
            className="rounded-md border border-[#c7c9d1] bg-white px-3 py-2 text-sm outline-none focus:border-[#5f72df]"
          >
            <option value="">Не привʼязано до раунду</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df]"
          />
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df]"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Місце (онлайн / адреса)"
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df] md:col-span-2"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опис (опційно)"
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df] md:col-span-2"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !title.trim() || !startsAt}
            className="inline-flex items-center gap-2 rounded-md bg-[#5f72df] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4d63cd] disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Додати подію
          </button>
        </div>
      </div>
    </section>
  );
}
