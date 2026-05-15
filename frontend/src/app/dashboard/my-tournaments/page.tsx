"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Crown, Gavel, Loader2, Star, Trophy, Users } from "lucide-react";

import Footer from "@/components/shared/Footer";
import { useAuth } from "@/contexts/auth-context";
import { usersApi, type MyTournament } from "@/lib/api";

const STATUS_LABELS: Record<string, string> = {
  draft: "Чернетка",
  registration: "Реєстрація",
  active: "Триває",
  finished: "Завершено",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  registration: "bg-amber-100 text-amber-800",
  active: "bg-blue-100 text-blue-800",
  finished: "bg-green-100 text-green-800",
};

const ROLE_BADGE: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  captain: { label: "Капітан", class: "bg-[#fef3c7] text-[#92400e]", icon: Crown },
  member: { label: "Учасник", class: "bg-[#dbeafe] text-[#1e40af]", icon: Users },
  organizer: { label: "Організатор", class: "bg-[#fee2e2] text-[#991b1b]", icon: Star },
  judge: { label: "Журі", class: "bg-[#ddd6fe] text-[#5b21b6]", icon: Gavel },
};

function CtxLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-md border border-[#d0d0d2] bg-white px-3 py-1 text-xs font-semibold text-[#1B345B] transition hover:bg-[#eef2ff]"
    >
      <Icon className="size-3.5" />
      {label}
    </Link>
  );
}

function Card({ item }: { item: MyTournament }) {
  const status = item.status ?? "draft";
  const captainTeam = item.teams.find((t) => t.isCaptain);
  const memberTeams = item.teams.filter((t) => !t.isCaptain);
  return (
    <article className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={`/tournaments/${item.tournamentId}`}
            className="text-lg font-semibold text-[#111] transition hover:text-[#5f72df]"
          >
            {item.title}
          </Link>
          <div className="mt-1 flex flex-wrap gap-1">
            {item.roles.map((r) => {
              const def = ROLE_BADGE[r];
              if (!def) return null;
              const Icon = def.icon;
              return (
                <span
                  key={r}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${def.class}`}
                >
                  <Icon className="size-3" />
                  {def.label}
                </span>
              );
            })}
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </header>

      {captainTeam && (
        <p className="mt-3 text-sm text-[#5b5f69]">
          Ваша команда (капітан): <span className="font-semibold text-[#111]">{captainTeam.name}</span>
        </p>
      )}
      {memberTeams.length > 0 && (
        <p className="mt-1 text-sm text-[#5b5f69]">
          Учасник у:{" "}
          {memberTeams.map((t, i) => (
            <span key={t.id} className="font-semibold text-[#111]">
              {t.name}
              {i < memberTeams.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}
      {item.judgeStages.length > 0 && (
        <p className="mt-1 text-sm text-[#5b5f69]">
          Журі:{" "}
          {item.judgeStages
            .map((s) => s.title ?? "увесь турнір")
            .join(", ")}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <CtxLink
          href={`/tournaments/${item.tournamentId}`}
          label="Сторінка турніру"
          icon={Trophy}
        />
        {item.teams.length > 0 && status !== "finished" && (
          <CtxLink
            href={`/tournaments/${item.tournamentId}/submission`}
            label="Подача роботи"
            icon={Star}
          />
        )}
        {item.roles.includes("judge") && (
          <CtxLink href="/dashboard/jury" label="Оцінювання" icon={Gavel} />
        )}
        {(item.roles.includes("organizer") ||
          /* admins still see edit via /admin */ false) && (
          <CtxLink
            href={`/dashboard/organizer/${item.tournamentId}/edit`}
            label="Керування"
            icon={Crown}
          />
        )}
      </div>
    </article>
  );
}

export default function MyTournamentsPage() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !token) router.replace("/login");
  }, [isLoading, token, router]);

  const { data = [], isLoading: loading, error } = useQuery({
    queryKey: ["my-tournaments"],
    queryFn: () => usersApi.myTournaments(token!),
    enabled: Boolean(token),
  });

  useEffect(() => {
    console.log('[My Tournaments] Data from API:', data);
    console.log('[My Tournaments] Error:', error);
  }, [data, error]);

  const active = data.filter(
    (t) => t.status === "active" || t.status === "registration",
  );
  const finished = data.filter((t) => t.status === "finished");
  const drafts = data.filter((t) => t.status === "draft");

  return (
    <main className="flex min-h-screen flex-col bg-[#F4F7FB] font-sans text-[#161616]">
      <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
        >
          <span className="text-lg leading-none">←</span> Дашборд
        </Link>
        <span className="text-[24px] font-semibold tracking-wide">Мої турніри</span>
      </header>

      <section className="mx-auto w-full max-w-[1100px] flex-1 px-8 py-10">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={32} className="animate-spin text-[#6082e6]" />
          </div>
        ) : data.length === 0 ? (
          <p className="rounded-xl border border-[#E0E0E0] bg-white px-6 py-10 text-center text-sm text-[#666]">
            Ви ще не берете участі в жодному турнірі. Зайдіть на{" "}
            <Link href="/dashboard" className="font-semibold text-[#5f72df] hover:underline">
              дашборд
            </Link>{" "}
            щоб обрати турнір.
          </p>
        ) : (
          <div className="space-y-10">
            {active.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                  Активні ({active.length})
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {active.map((t) => (
                    <Card key={t.tournamentId} item={t} />
                  ))}
                </div>
              </section>
            )}
            {drafts.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                  Чернетки ({drafts.length})
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {drafts.map((t) => (
                    <Card key={t.tournamentId} item={t} />
                  ))}
                </div>
              </section>
            )}
            {finished.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                  Завершені ({finished.length})
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {finished.map((t) => (
                    <Card key={t.tournamentId} item={t} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
