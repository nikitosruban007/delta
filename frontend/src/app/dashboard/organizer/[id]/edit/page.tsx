"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Download, Loader2, Save } from "lucide-react";

import BrandMark from "@/components/shared/BrandMark";
import Footer from "@/components/shared/Footer";
import { CriteriaEditor } from "@/components/organizer/CriteriaEditor";
import { ScheduleEditor } from "@/components/organizer/ScheduleEditor";
import {
  certificatesApi,
  exportApi,
  tournamentManagementApi,
  tournamentsApi,
  ApiError,
  type UpdateTournamentInput,
  type TournamentStatus,
} from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function fromDateInput(value: string): string | null {
  if (!value.trim()) return null;
  return new Date(value).toISOString();
}

export default function EditTournamentPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { token, user, hasRole, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => tournamentsApi.getById(id, token),
    enabled: Boolean(token),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["tournament-teams", id],
    queryFn: () => tournamentsApi.getTeams(id, token),
    enabled: Boolean(token && tournament?.status === "finished"),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxTeams, setMaxTeams] = useState("");
  const [teamSizeMin, setTeamSizeMin] = useState("");
  const [teamSizeMax, setTeamSizeMax] = useState("");
  const [status, setStatus] = useState<TournamentStatus>("draft");
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!tournament) return;
    setTitle(tournament.title);
    setDescription(tournament.description ?? "");
    setRules(tournament.rules ?? "");
    setRegistrationDeadline(toDateInput(tournament.registrationDeadline));
    setStartsAt(toDateInput(tournament.startsAt));
    setEndsAt(toDateInput(tournament.endsAt));
    setMaxTeams(tournament.maxTeams != null ? String(tournament.maxTeams) : "");
    setTeamSizeMin(
      tournament.teamSizeMin != null ? String(tournament.teamSizeMin) : "",
    );
    setTeamSizeMax(
      tournament.teamSizeMax != null ? String(tournament.teamSizeMax) : "",
    );
    setStatus(tournament.status);
  }, [tournament]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (!hasRole("ORGANIZER") && !hasRole("ADMIN"))) {
      router.push("/dashboard");
    }
  }, [authLoading, user, hasRole, router]);

  const isOwner =
    Boolean(user) &&
    (hasRole("ADMIN") || (tournament && tournament.organizerId === user!.id));

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Not authenticated");
      const min = teamSizeMin ? Number(teamSizeMin) : undefined;
      const max = teamSizeMax ? Number(teamSizeMax) : undefined;
      if (min !== undefined && max !== undefined && min > max) {
        throw new Error("teamSizeMin не може бути більшим за teamSizeMax");
      }
      const payload: UpdateTournamentInput = {
        title: title.trim(),
        description: description.trim(),
        rules: rules.trim(),
        registrationDeadline: fromDateInput(registrationDeadline),
        startsAt: fromDateInput(startsAt),
        endsAt: fromDateInput(endsAt),
        ...(maxTeams ? { maxTeams: Number(maxTeams) } : {}),
        ...(min !== undefined ? { teamSizeMin: min } : {}),
        ...(max !== undefined ? { teamSizeMax: max } : {}),
        status,
      };
      return tournamentManagementApi.update(id, payload, token);
    },
    onSuccess: () => {
      setSaved(true);
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ["tournament", id] });
      queryClient.invalidateQueries({ queryKey: ["all-tournaments"] });
    },
    onError: (err) => {
      setSaved(false);
      setServerError(err instanceof ApiError ? err.message : (err as Error).message);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    if (!title.trim()) {
      setServerError("Назва турніру обов'язкова");
      return;
    }
    updateMutation.mutate();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f6]">
        <Loader2 className="size-10 animate-spin text-[#5f72df]" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f6]">
        <p className="text-[#666]">Турнір не знайдено</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f6]">
        <p className="text-[#666]">У вас немає прав редагувати цей турнір</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#111111]">
      <header className="bg-[#0b3372]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href="/dashboard/organizer"
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#d8e8ff] px-4 py-2 text-sm font-semibold text-[#0a3268] transition hover:bg-[#e6f0ff]"
          >
            <ArrowLeft className="size-4" /> До дашборду
          </Link>
          <BrandMark />
        </div>
      </header>

      <section className="mx-auto w-full max-w-[860px] flex-1 px-5 py-10">
        <h1 className="mb-2 text-3xl font-semibold">Редагувати турнір</h1>
        <p className="mb-8 text-sm text-[#5b5f69]">
          Зміни одразу застосовуються до подальших дій учасників.
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-[12px] border border-[#d6d6d9] bg-white p-6 shadow-sm space-y-5"
        >
          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </p>
          )}
          {saved && (
            <p className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="size-4" /> Збережено
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold">Назва</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={200}
              className="w-full rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Опис</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={5000}
              className="w-full resize-y rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Правила</label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={6}
              maxLength={20000}
              className="w-full resize-y rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">Дедлайн реєстрації</label>
              <input
                type="date"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Старт</label>
              <input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Завершення</label>
              <input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">Макс. команд</label>
              <input
                type="number"
                min={1}
                value={maxTeams}
                onChange={(e) => setMaxTeams(e.target.value)}
                className="w-full rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Учасників мін.</label>
              <input
                type="number"
                min={1}
                value={teamSizeMin}
                onChange={(e) => setTeamSizeMin(e.target.value)}
                className="w-full rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Учасників макс.</label>
              <input
                type="number"
                min={1}
                value={teamSizeMax}
                onChange={(e) => setTeamSizeMax(e.target.value)}
                className="w-full rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TournamentStatus)}
              className="w-full rounded-[8px] border border-[#c7c9d1] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
            >
              <option value="draft">Чернетка</option>
              <option value="registration">Реєстрація</option>
              <option value="active">Активний</option>
              <option value="finished">Завершено</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#5f72df] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d63cd] disabled:opacity-60"
          >
            {updateMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Зберегти
          </button>
        </form>

        {token && id && (
          <div className="mt-8">
            <CriteriaEditor tournamentId={id} token={token} />
          </div>
        )}

        {token && id && (
          <div className="mt-8">
            <ScheduleEditor tournamentId={id} token={token} />
          </div>
        )}

        {token && id && (
          <div className="mt-8 rounded-[12px] border border-[#dadce5] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111]">Експорт</h3>
            <p className="mt-1 text-xs text-[#5b5f69]">
              Завантажити дані турніру у форматі CSV.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  exportApi.download(
                    exportApi.teamLeaderboardUrl(id),
                    `tournament-${id}-teams.csv`,
                    token,
                  )
                }
                className="inline-flex items-center gap-2 rounded-md bg-[#1B345B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#15294a]"
              >
                <Download className="size-4" />
                Лідерборд команд (CSV)
              </button>
              <button
                type="button"
                onClick={() =>
                  exportApi.download(
                    exportApi.submissionsUrl(id),
                    `tournament-${id}-submissions.csv`,
                    token,
                  )
                }
                className="inline-flex items-center gap-2 rounded-md bg-[#5f72df] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4d63cd]"
              >
                <Download className="size-4" />
                Сабміти + оцінки (CSV)
              </button>
            </div>
          </div>
        )}

        {token && id && tournament?.status === "finished" && teams.length > 0 && (
          <div className="mt-8 rounded-[12px] border border-[#dadce5] bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111]">
              Сертифікати команд (PDF)
            </h3>
            <p className="mt-1 text-xs text-[#5b5f69]">
              Завантажте персональний PDF-сертифікат для кожної команди.
            </p>
            <ul className="mt-4 grid gap-2 md:grid-cols-2">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="flex items-center justify-between rounded-lg border border-[#e6e8ef] bg-[#fafbff] px-4 py-2.5"
                >
                  <span className="truncate text-sm font-semibold text-[#111]">
                    {team.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      exportApi.download(
                        certificatesApi.teamCertificateUrl(id, team.id),
                        `certificate-${team.name.replace(/[^a-zA-Z0-9-]+/g, "_").slice(0, 40) || "team"}.pdf`,
                        token,
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-md bg-[#1B345B] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#15294a]"
                  >
                    <Download className="size-3.5" />
                    PDF
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
