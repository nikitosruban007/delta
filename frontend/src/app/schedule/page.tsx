"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Loader2, MapPin } from "lucide-react";

import Footer from "@/components/shared/Footer";
import { scheduleApi, type TournamentEvent } from "@/lib/api";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDate(events: TournamentEvent[]) {
  const groups = new Map<string, TournamentEvent[]>();
  for (const e of events) {
    const key = new Date(e.startsAt).toISOString().slice(0, 10);
    const arr = groups.get(key) ?? [];
    arr.push(e);
    groups.set(key, arr);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default function SchedulePage() {
  const [filter, setFilter] = useState<"upcoming" | "all" | "past">("upcoming");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["schedule-global", filter],
    queryFn: () => {
      const now = new Date().toISOString();
      if (filter === "upcoming") return scheduleApi.listGlobal({ from: now, limit: 200 });
      if (filter === "past") return scheduleApi.listGlobal({ to: now, limit: 200 });
      return scheduleApi.listGlobal({ limit: 200 });
    },
  });

  const grouped = useMemo(() => groupByDate(events), [events]);

  return (
    <main className="flex min-h-screen flex-col bg-[#F4F7FB] font-sans text-[#161616]">
      <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
        >
          <span className="text-lg leading-none">←</span> Дашборд
        </Link>
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5" />
          <span className="text-[24px] font-semibold tracking-wide">Розклад</span>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1000px] flex-1 px-8 py-10">
        <div className="mb-6 flex items-center gap-2">
          {(
            [
              ["upcoming", "Майбутні"],
              ["all", "Усі"],
              ["past", "Минулі"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filter === key
                  ? "bg-[#1B345B] text-white"
                  : "bg-white text-[#1B345B] hover:bg-[#e4edfa]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={32} className="animate-spin text-[#6082e6]" />
          </div>
        ) : grouped.length === 0 ? (
          <p className="rounded-xl border border-[#E0E0E0] bg-white px-6 py-10 text-center text-sm text-[#666]">
            Подій не знайдено.
          </p>
        ) : (
          <div className="space-y-8">
            {grouped.map(([dateKey, list]) => (
              <section key={dateKey}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                  {fmtDate(list[0].startsAt)}
                </h2>
                <div className="space-y-2">
                  {list
                    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                    .map((e) => (
                      <div
                        key={e.id}
                        className="flex gap-4 rounded-xl border border-[#E0E0E0] bg-white p-4 shadow-sm"
                      >
                        <div className="w-24 shrink-0 text-sm font-semibold text-[#1B345B]">
                          <p>{fmtTime(e.startsAt)}</p>
                          {e.endsAt && (
                            <p className="text-xs font-normal text-[#888]">
                              до {fmtTime(e.endsAt)}
                            </p>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-[#111]">{e.title}</p>
                            {e.tournament && (
                              <Link
                                href={`/tournaments/${e.tournament.id}`}
                                className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold text-[#3f4b73] transition hover:bg-[#dbe4ff]"
                              >
                                {e.tournament.title}
                              </Link>
                            )}
                            {e.round && (
                              <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#9a3412]">
                                {e.round.title}
                              </span>
                            )}
                          </div>
                          {e.description && (
                            <p className="mt-1 text-xs text-[#5b5f69]">{e.description}</p>
                          )}
                          {e.location && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#888]">
                              <MapPin className="size-3" />
                              {e.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
