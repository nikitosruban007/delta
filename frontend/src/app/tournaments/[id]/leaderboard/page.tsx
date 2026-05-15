"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";

import BrandMark from "@/components/shared/BrandMark";
import Footer from "@/components/shared/Footer";
import { tournamentsApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function LeaderboardPage() {
  const params = useParams<{ id: string }>();
  const tournamentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token } = useAuth();
  const [roundId, setRoundId] = useState<string | "">("");

  const { data: tournament } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => tournamentsApi.getById(tournamentId, token),
  });

  const { data: rounds = [] } = useQuery({
    queryKey: ["tournament-rounds", tournamentId],
    queryFn: () => tournamentsApi.getRounds(tournamentId, token),
    enabled: Boolean(tournament),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", tournamentId, roundId || "overall"],
    queryFn: () =>
      tournamentsApi.getTeamLeaderboard(
        tournamentId,
        token,
        roundId || undefined,
      ),
    enabled: Boolean(tournament),
  });

  const items = data?.items ?? [];
  const criteria = data?.criteria ?? [];
  const showPerCriterion = !roundId && criteria.length > 0;

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#101724]">
      <header className="bg-[#0b3372]">
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

      <nav className="border-b border-[#d6d6d9] bg-[#e7e7e9]">
        <div className="mx-auto flex w-full max-w-[1440px] items-stretch px-5 md:px-12">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="border-r border-[#d0d0d2] px-5 py-3 text-sm font-medium text-[#3a4351] transition hover:bg-[#dcdce0]"
          >
            Головна ›
          </Link>
          <span className="border-r border-[#d0d0d2] bg-white px-5 py-3 text-sm font-semibold underline underline-offset-4">
            Лідерборд ⌄
          </span>
          <Link
            href="/dashboard/jury"
            className="px-5 py-3 text-sm font-medium text-[#3a4351] transition hover:bg-[#dcdce0]"
          >
            Список робіт для оцінювання ›
          </Link>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold md:text-3xl">
            Лідерборд {tournament?.title ? `— ${tournament.title}` : ""}
          </h1>
          {rounds.length > 1 && (
            <div className="relative">
              <select
                value={roundId}
                onChange={(e) => setRoundId(e.target.value)}
                className="appearance-none rounded-md border border-[#d0d0d2] bg-white px-4 py-2 pr-9 text-sm outline-none focus:border-[#5f72df]"
              >
                <option value="">Загальний лідерборд</option>
                {rounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    Тільки: {r.title}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-4 text-[#888]"
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-8 animate-spin text-[#5f72df]" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md border border-[#d0d0d2] bg-white px-6 py-16 text-center text-sm text-[#666]">
            Лідерборд ще не сформовано. Дочекайтесь оцінювання журі.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[#d0d0d2] bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#fafbff] text-left text-xs uppercase tracking-wide text-[#5b5f69]">
                <tr>
                  <th className="border-r border-[#e6e8ef] px-4 py-3 font-semibold">
                    Команда
                  </th>
                  {showPerCriterion &&
                    criteria.map((c) => (
                      <th
                        key={c.id}
                        className="border-r border-[#e6e8ef] px-4 py-3 font-semibold"
                      >
                        {c.title}
                      </th>
                    ))}
                  <th className="px-4 py-3 text-right font-semibold">
                    Загальна сума балів
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr
                    key={row.teamId ?? row.rank}
                    className="border-t border-[#e6e8ef]"
                  >
                    <td className="border-r border-[#e6e8ef] bg-[#5f72df]/85 px-4 py-3 font-semibold text-white">
                      {row.rank === 1 && "🏆 "}
                      {row.teamName}
                    </td>
                    {showPerCriterion &&
                      criteria.map((c) => {
                        const cell = row.breakdown?.find(
                          (b) => b.criterionId === c.id,
                        );
                        return (
                          <td
                            key={c.id}
                            className="border-r border-[#e6e8ef] px-4 py-3 text-center font-mono text-[13px]"
                          >
                            {cell?.averageScore === null ||
                            cell?.averageScore === undefined
                              ? "—"
                              : cell.averageScore.toFixed(2)}
                          </td>
                        );
                      })}
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      {row.totalScore.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
