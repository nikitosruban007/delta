"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Check,
  Crown,
  Flag,
  Loader2,
  Search,
  Shield,
  Trophy,
  UserPlus,
  X,
} from "lucide-react";

import Footer from "@/components/shared/Footer";
import { useAuth } from "@/contexts/auth-context";
import {
  adminApi,
  forumApi,
  tournamentsApi,
  type AdminUser,
  type Tournament,
  type TournamentStatus,
} from "@/lib/api";

const ROLE_BADGE: Record<string, { label: string; class: string }> = {
  ADMIN: { label: "Admin", class: "bg-[#fee2e2] text-[#991b1b]" },
  ORGANIZER: { label: "Organizer", class: "bg-[#fef3c7] text-[#92400e]" },
  JUDGE: { label: "Judge", class: "bg-[#dbeafe] text-[#1e40af]" },
  PARTICIPANT: { label: "Participant", class: "bg-[#e5e7eb] text-[#374151]" },
};

const STATUS_BADGE: Record<TournamentStatus, string> = {
  draft: "bg-[#e5e7eb] text-[#374151]",
  registration: "bg-[#fef3c7] text-[#92400e]",
  active: "bg-[#dbeafe] text-[#1e40af]",
  finished: "bg-[#dcfce7] text-[#166534]",
};

export default function AdminPanelPage() {
  const router = useRouter();
  const { token, hasRole, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"stats" | "users" | "tournaments" | "reports">("stats");
  const [reportFilter, setReportFilter] = useState<"open" | "resolved" | "all">("open");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tournamentStatus, setTournamentStatus] = useState<"" | TournamentStatus>("");
  const [busyUser, setBusyUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [authLoading, hasRole, router]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch],
    queryFn: () => adminApi.listUsers(token!, debouncedSearch || undefined),
    enabled: Boolean(token) && hasRole("ADMIN"),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => adminApi.listRoles(token!),
    enabled: Boolean(token) && hasRole("ADMIN"),
  });

  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ["admin-tournaments", tournamentStatus],
    queryFn: () => tournamentsApi.list(tournamentStatus || undefined, token),
    enabled: Boolean(token) && hasRole("ADMIN") && tab === "tournaments",
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["admin-forum-reports", reportFilter],
    queryFn: () => forumApi.listReports(token!, reportFilter),
    enabled: Boolean(token) && hasRole("ADMIN") && tab === "reports",
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.stats(token!),
    enabled: Boolean(token) && hasRole("ADMIN") && tab === "stats",
  });

  const resolveReportMutation = useMutation({
    mutationFn: (id: number) => forumApi.resolveReport(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-reports"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => {
      setBusyUser(userId);
      return adminApi.assignRole(userId, roleName, token!);
    },
    onSettled: () => {
      setBusyUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const revokeMutation = useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => {
      setBusyUser(userId);
      return adminApi.revokeRole(userId, roleName, token!);
    },
    onSettled: () => {
      setBusyUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (authLoading || !hasRole("ADMIN")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <Loader2 size={40} className="animate-spin text-[#6082e6]" />
      </div>
    );
  }

  const userHasRole = (user: AdminUser, name: string) =>
    user.roles.some((r) => r.name === name);

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
          <Shield className="size-5" />
          <span className="text-[24px] font-semibold tracking-wide">Admin Panel</span>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-10">
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTab("stats")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "stats"
                ? "bg-[#1B345B] text-white"
                : "bg-white text-[#1B345B] hover:bg-[#e4edfa]"
            }`}
          >
            <BarChart3 className="size-4" />
            Огляд
          </button>
          <button
            type="button"
            onClick={() => setTab("users")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "users"
                ? "bg-[#1B345B] text-white"
                : "bg-white text-[#1B345B] hover:bg-[#e4edfa]"
            }`}
          >
            <Crown className="size-4" />
            Користувачі
          </button>
          <button
            type="button"
            onClick={() => setTab("tournaments")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "tournaments"
                ? "bg-[#1B345B] text-white"
                : "bg-white text-[#1B345B] hover:bg-[#e4edfa]"
            }`}
          >
            <Trophy className="size-4" />
            Турніри
          </button>
          <button
            type="button"
            onClick={() => setTab("reports")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === "reports"
                ? "bg-[#1B345B] text-white"
                : "bg-white text-[#1B345B] hover:bg-[#e4edfa]"
            }`}
          >
            <Flag className="size-4" />
            Скарги
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X className="size-4" />
            </button>
          </div>
        )}

        {tab === "stats" && (
          <div className="space-y-6">
            {!stats ? (
              <div className="flex justify-center py-10">
                <Loader2 size={32} className="animate-spin text-[#6082e6]" />
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Користувачів", value: stats.users },
                    { label: "Турнірів", value: stats.tournaments },
                    { label: "Команд", value: stats.teams },
                    { label: "Сабмітів", value: stats.submissions },
                    { label: "Оцінок", value: stats.evaluations },
                    { label: "Оголошень", value: stats.announcements },
                    { label: "Тем форуму", value: stats.forumTopics },
                    { label: "Постів форуму", value: stats.forumPosts },
                    {
                      label: "Відкритих скарг",
                      value: stats.openReports,
                      accent: stats.openReports > 0,
                    },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className={`rounded-xl border bg-white p-5 shadow-sm ${
                        c.accent
                          ? "border-[#fecaca] bg-[#fef2f2]"
                          : "border-[#E0E0E0]"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wide text-[#5b5f69]">
                        {c.label}
                      </p>
                      <p className="mt-1 text-3xl font-bold text-[#1B345B]">
                        {c.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                    Турніри за статусом
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {(["draft", "registration", "active", "finished"] as const).map(
                      (s) => (
                        <div key={s} className="rounded-md bg-[#fafbff] p-3">
                          <p className="text-xs text-[#5b5f69]">{s.toUpperCase()}</p>
                          <p className="text-2xl font-bold text-[#1B345B]">
                            {stats.tournamentsByStatus[s] ?? 0}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 shadow-sm">
              <Search size={18} className="text-[#888]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Пошук email / username / імʼя…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#999]"
              />
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={32} className="animate-spin text-[#6082e6]" />
              </div>
            ) : users.length === 0 ? (
              <p className="rounded-xl border border-[#E0E0E0] bg-white px-6 py-10 text-center text-sm text-[#666]">
                Користувачів не знайдено.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f7ff] text-left text-xs uppercase tracking-wide text-[#5b5f69]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Користувач</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Ролі</th>
                      <th className="px-4 py-3 font-semibold">Управління</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isBusy = busyUser === u.id;
                      return (
                        <tr key={u.id} className="border-t border-[#eee]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-bold text-[#5f72df]">
                                  {u.name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-[#111]">{u.name}</p>
                                {u.username && (
                                  <p className="text-xs text-[#888]">@{u.username}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#444]">{u.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {u.roles.map((r) => {
                                const badge = ROLE_BADGE[r.name] ?? {
                                  label: r.name,
                                  class: "bg-[#e5e7eb] text-[#374151]",
                                };
                                return (
                                  <span
                                    key={r.id}
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.class}`}
                                  >
                                    {badge.label}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        revokeMutation.mutate({ userId: u.id, roleName: r.name })
                                      }
                                      disabled={isBusy}
                                      className="ml-1 transition hover:opacity-70 disabled:opacity-40"
                                      title="Зняти роль"
                                    >
                                      <X className="size-3" />
                                    </button>
                                  </span>
                                );
                              })}
                              {u.roles.length === 0 && (
                                <span className="text-xs text-[#999]">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {roles
                                .filter((r) => !userHasRole(u, r.name))
                                .map((r) => (
                                  <button
                                    key={r.id}
                                    type="button"
                                    onClick={() =>
                                      assignMutation.mutate({ userId: u.id, roleName: r.name })
                                    }
                                    disabled={isBusy}
                                    className="inline-flex items-center gap-1 rounded-md border border-[#d0d0d2] bg-white px-2 py-1 text-[11px] font-semibold text-[#1B345B] transition hover:bg-[#eef2ff] disabled:opacity-40"
                                  >
                                    <UserPlus className="size-3" />
                                    {r.name}
                                  </button>
                                ))}
                              {isBusy && (
                                <Loader2 size={14} className="animate-spin text-[#6082e6]" />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(["open", "resolved", "all"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReportFilter(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    reportFilter === s
                      ? "bg-[#1B345B] text-white"
                      : "bg-white text-[#1B345B] hover:bg-[#e4edfa]"
                  }`}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>

            {reportsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={32} className="animate-spin text-[#6082e6]" />
              </div>
            ) : reports.length === 0 ? (
              <p className="rounded-xl border border-[#E0E0E0] bg-white px-6 py-10 text-center text-sm text-[#666]">
                Скарг немає.
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-[#E0E0E0] bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`rounded-full px-2 py-0.5 font-semibold ${
                              r.status === "open"
                                ? "bg-[#fee2e2] text-[#991b1b]"
                                : "bg-[#dcfce7] text-[#166534]"
                            }`}
                          >
                            {r.status.toUpperCase()}
                          </span>
                          {r.post && (
                            <Link
                              href={`/forum/${r.post.topicId}`}
                              className="rounded-full bg-[#eef2ff] px-2 py-0.5 font-semibold text-[#3f4b73] transition hover:bg-[#dbe4ff]"
                            >
                              Пост #{r.post.id} у темі #{r.post.topicId}
                            </Link>
                          )}
                          {r.topic && (
                            <Link
                              href={`/forum/${r.topic.id}`}
                              className="rounded-full bg-[#eef2ff] px-2 py-0.5 font-semibold text-[#3f4b73] transition hover:bg-[#dbe4ff]"
                            >
                              Тема: {r.topic.title}
                            </Link>
                          )}
                          {r.reporter && (
                            <span className="text-[#666]">
                              Скарга від <span className="font-semibold text-[#111]">{r.reporter.name}</span> ({r.reporter.email})
                            </span>
                          )}
                          {r.createdAt && (
                            <span className="text-[#999]">
                              {new Date(r.createdAt).toLocaleString("uk-UA")}
                            </span>
                          )}
                        </div>
                        <p className="rounded-md bg-[#fef3c7] px-3 py-2 text-sm text-[#92400e]">
                          <span className="font-semibold">Причина:</span> {r.reason}
                        </p>
                        {r.post?.content && (
                          <p className="mt-2 rounded-md border border-[#eee] bg-[#fafafa] px-3 py-2 text-xs italic text-[#555]">
                            {r.post.content.slice(0, 400)}
                            {r.post.content.length > 400 ? "…" : ""}
                          </p>
                        )}
                      </div>
                      {r.status === "open" && (
                        <button
                          type="button"
                          onClick={() => resolveReportMutation.mutate(r.id)}
                          disabled={resolveReportMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-md bg-[#16a34a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#15803d] disabled:opacity-50"
                        >
                          <Check className="size-3.5" />
                          Закрити
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "tournaments" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(["", "draft", "registration", "active", "finished"] as const).map((s) => (
                <button
                  key={s || "all"}
                  type="button"
                  onClick={() => setTournamentStatus(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    tournamentStatus === s
                      ? "bg-[#1B345B] text-white"
                      : "bg-white text-[#1B345B] hover:bg-[#e4edfa]"
                  }`}
                >
                  {s ? s.toUpperCase() : "ВСІ"}
                </button>
              ))}
            </div>

            {tournamentsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={32} className="animate-spin text-[#6082e6]" />
              </div>
            ) : tournaments.length === 0 ? (
              <p className="rounded-xl border border-[#E0E0E0] bg-white px-6 py-10 text-center text-sm text-[#666]">
                Турнірів не знайдено.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-[#E0E0E0] bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f7ff] text-left text-xs uppercase tracking-wide text-[#5b5f69]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Назва</th>
                      <th className="px-4 py-3 font-semibold">Статус</th>
                      <th className="px-4 py-3 font-semibold">Створено</th>
                      <th className="px-4 py-3 font-semibold">Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((t: Tournament) => (
                      <tr key={t.id} className="border-t border-[#eee]">
                        <td className="px-4 py-3 font-semibold text-[#111]">{t.title}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              STATUS_BADGE[t.status]
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#666]">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString("uk-UA") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/tournaments/${t.id}`}
                              className="rounded-md border border-[#d0d0d2] px-3 py-1 text-xs font-semibold text-[#1B345B] transition hover:bg-[#eef2ff]"
                            >
                              Переглянути
                            </Link>
                            <Link
                              href={`/dashboard/organizer/${t.id}/edit`}
                              className="rounded-md bg-[#5f72df] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#4d63cd]"
                            >
                              Редагувати
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
