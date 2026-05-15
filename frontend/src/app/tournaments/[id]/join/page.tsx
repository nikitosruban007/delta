"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Search,
  Send,
  Trash2,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import BrandMark from "@/components/shared/BrandMark";
import { AccentDot, DotGrid } from "@/components/shared/Decor";
import Footer from "@/components/shared/Footer";
import { useAuth } from "@/contexts/auth-context";
import {
  ApiError,
  teamsApi,
  tournamentsApi,
  usersApi,
  type UserSearchResult,
} from "@/lib/api";

type Member = {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  username: string | null;
};

const inputClass =
  "h-10 rounded-[6px] border border-[#d0d0d2] bg-white px-4 text-sm text-[#111111] outline-none transition placeholder:text-[#888] focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15";

export default function TournamentJoinPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const tournamentId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { token, isAuthenticated, user, hasRole } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [captainQuery, setCaptainQuery] = useState("");
  const [debouncedCaptainQuery, setDebouncedCaptainQuery] = useState("");
  const [selectedCaptain, setSelectedCaptain] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedCaptainQuery(captainQuery.trim()),
      250,
    );
    return () => clearTimeout(timer);
  }, [captainQuery]);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => tournamentsApi.getById(tournamentId),
  });

  const { data: searchResults, isFetching: searching } = useQuery({
    queryKey: ["users-search", debouncedQuery],
    queryFn: () => usersApi.search(debouncedQuery, token!),
    enabled: Boolean(token) && debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const { data: captainSearchResults, isFetching: searchingCaptain } = useQuery({
    queryKey: ["users-search-captain", debouncedCaptainQuery],
    queryFn: () => usersApi.search(debouncedCaptainQuery, token!),
    enabled: Boolean(token) && debouncedCaptainQuery.length >= 2,
    staleTime: 30_000,
  });

  const minMembers = tournament?.teamSizeMin ?? 2;
  const maxMembers = tournament?.teamSizeMax ?? 5;
  // members[] excludes captain; captain counted separately.
  const totalSize = members.length + 1;

  const addMember = (candidate: UserSearchResult) => {
    setSearchQuery("");
    setDebouncedQuery("");
    if (user && candidate.email.toLowerCase() === user.email?.toLowerCase()) {
      setServerError("Капітан уже додається автоматично");
      return;
    }
    if (members.some((m) => m.email.toLowerCase() === candidate.email.toLowerCase())) {
      setServerError("Цей учасник уже доданий");
      return;
    }
    if (totalSize >= maxMembers) {
      setServerError(`Максимум ${maxMembers} учасників у команді`);
      return;
    }
    setServerError(null);
    setMembers((prev) => [
      ...prev,
      {
        userId: candidate.id,
        email: candidate.email,
        fullName: candidate.name,
        avatarUrl: candidate.avatarUrl,
        username: candidate.username,
      },
    ]);
  };

  const selectCaptain = (candidate: UserSearchResult) => {
    setCaptainQuery("");
    setDebouncedCaptainQuery("");
    setSelectedCaptain({
      userId: candidate.id,
      email: candidate.email,
      fullName: candidate.name,
      avatarUrl: candidate.avatarUrl,
      username: candidate.username,
    });
  };

  const removeMember = (index: number) =>
    setMembers((prev) => prev.filter((_, i) => i !== index));

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
    if (totalSize < minMembers) {
      setServerError(`Потрібно щонайменше ${minMembers} учасники (включно з капітаном)`);
      return;
    }

    const isOrganizerAction =
      user?.id === tournament?.organizerId || hasRole("ADMIN");
    if (isOrganizerAction && !selectedCaptain) {
      setServerError("Виберіть капітана для цієї команди");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await teamsApi.register(
        {
          tournamentId,
          name: teamName.trim(),
          members: members.map((m) => ({ fullName: m.fullName, email: m.email })),
          captainId: selectedCaptain?.userId,
          captainEmail: selectedCaptain?.email,
        },
        token,
      );
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

  const filteredResults = (searchResults ?? []).filter(
    (r) =>
      r.id !== user?.id &&
      !members.some((m) => m.email.toLowerCase() === r.email.toLowerCase()),
  );

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
          className="relative z-10 overflow-hidden rounded-[10px] border border-[#d6d6d9] bg-white shadow-[0_18px_60px_rgba(17,17,17,0.08)]"
        >
          <div className="border-b border-[#d1d1d3] bg-[#f7f7f8] px-5 py-6 md:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">
              {tournament?.title ?? "Турнір"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Реєстрація команди</h1>
            <p className="mt-2 text-sm text-[#5b5f69]">
              Розмір команди: від {minMembers} до {maxMembers} (включно з капітаном).
            </p>
            {tournament &&
              (tournament.status !== "registration" ||
                (tournament.registrationDeadline &&
                  new Date(tournament.registrationDeadline).getTime() < Date.now())) &&
              (user?.id === tournament.organizerId || hasRole("ADMIN")) && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#9a3412]">
                  Реєстрація закрита для звичайних учасників. Ви додаєте команду
                  як організатор турніру.
                </p>
              )}
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

            <label className="block max-w-[420px]">
              <span className="mb-2 block text-sm font-semibold text-[#414143]">Назва команди</span>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Назва команди"
                className="h-12 w-full rounded-[6px] border border-[#d0d0d2] bg-white px-5 text-base outline-none transition placeholder:text-[#888] focus:border-[#5f72df] focus:ring-4 focus:ring-[#5f72df]/15"
                required
              />
            </label>

            {/* Captain */}
            <section className="rounded-[10px] border border-[#d0d0d2] bg-[#fbfbfc]">
              <div className="flex items-center justify-between bg-[#0b3372] px-4 py-2.5 text-sm font-medium text-white">
                <span className="inline-flex items-center gap-2">
                  <UsersRound className="size-4" />
                  Капітан
                </span>
                <span className="text-xs opacity-80">
                  {user?.id === tournament?.organizerId || hasRole("ADMIN")
                    ? "Оберіть капітана"
                    : "Це ви"}
                </span>
              </div>
              <div className="px-4 py-4 md:px-6">
                {(user?.id === tournament?.organizerId || hasRole("ADMIN")) ? (
                  <>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#414143]">
                        Знайти капітана за email або іменем
                      </span>
                      <input
                        value={captainQuery}
                        onChange={(e) => setCaptainQuery(e.target.value)}
                        placeholder="Пошук капітана"
                        className={inputClass}
                      />
                    </label>
                    {captainSearchResults && captainSearchResults.length > 0 && (
                      <div className="mt-3 space-y-2 rounded-[10px] border border-[#d0d0d2] bg-white p-3">
                        {captainSearchResults.map((candidate) => (
                          <button
                            key={candidate.id}
                            type="button"
                            onClick={() => selectCaptain(candidate)}
                            className="flex w-full items-center justify-between rounded-[8px] border border-transparent px-3 py-2 text-left text-sm transition hover:border-[#c5c5c8] hover:bg-[#f7f7f8]"
                          >
                            <div>
                              <div className="font-semibold text-[#111]">{candidate.name}</div>
                              <div className="text-[#666]">{candidate.email}</div>
                            </div>
                            <span className="text-[#5f72df]">Оберіть</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedCaptain ? (
                      <div className="mt-4 flex items-center gap-3 rounded-[10px] border border-[#d0d0d2] bg-white px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4edfa] text-sm font-bold text-[#1B345B]">
                          {selectedCaptain.fullName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold">{selectedCaptain.fullName}</p>
                          <p className="text-[#888]">{selectedCaptain.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-[#666]">
                        Вкажіть капітана команди, щоб продовжити реєстрацію.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4edfa] text-sm font-bold text-[#1B345B]">
                      {user?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-[#888]">{user?.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Added members */}
            {members.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                  Учасники команди ({members.length})
                </h2>
                {members.map((m, index) => (
                  <section
                    key={m.userId}
                    className="flex items-center justify-between rounded-[10px] border border-[#d0d0d2] bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {m.avatarUrl ? (
                        <img src={m.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff] text-sm font-bold text-[#5f72df]">
                          {m.fullName[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div className="text-sm">
                        <p className="font-semibold">
                          {m.fullName}
                          {m.username ? (
                            <span className="ml-2 text-xs text-[#888]">@{m.username}</span>
                          ) : null}
                        </p>
                        <p className="text-[#888]">{m.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#a0263c] transition hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                      Прибрати
                    </button>
                  </section>
                ))}
              </div>
            )}

            {/* Search */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                Додати учасника
              </h2>
              <div className="relative">
                <div className="flex items-center gap-2 rounded-[8px] border border-[#d0d0d2] bg-white px-4 py-2.5">
                  <Search className="size-4 text-[#888]" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Пошук за email, @username або імʼям…"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#888]"
                  />
                  {searching && <Loader2 className="size-4 animate-spin text-[#5f72df]" />}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-[#888] transition hover:text-[#111]"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                {debouncedQuery.length >= 2 && (
                  <div className="mt-2 overflow-hidden rounded-[8px] border border-[#d0d0d2] bg-white shadow-sm">
                    {filteredResults.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-[#888]">
                        {searching ? "Пошук…" : "Нічого не знайдено"}
                      </p>
                    ) : (
                      filteredResults.map((r) => (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => addMember(r)}
                          className="flex w-full items-center justify-between gap-3 border-b border-[#eee] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#f5f7ff]"
                        >
                          <div className="flex items-center gap-3">
                            {r.avatarUrl ? (
                              <img src={r.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] text-xs font-bold text-[#5f72df]">
                                {r.name[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                            <div className="text-sm">
                              <p className="font-semibold">
                                {r.name}
                                {r.username ? (
                                  <span className="ml-2 text-xs text-[#888]">@{r.username}</span>
                                ) : null}
                              </p>
                              <p className="text-[#888]">{r.email}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#5f72df] px-3 py-1 text-xs font-semibold text-white">
                            <UserPlus className="size-3" />
                            Додати
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {debouncedQuery.length > 0 && debouncedQuery.length < 2 && (
                  <p className="mt-2 text-xs text-[#888]">Введіть щонайменше 2 символи</p>
                )}
              </div>
            </section>

            <div className="flex items-center gap-2 text-xs text-[#5b5f69]">
              {totalSize >= minMembers ? (
                <span className="inline-flex items-center gap-1 text-green-700">
                  <Check className="size-4" />
                  Розмір команди: {totalSize}/{maxMembers}
                </span>
              ) : (
                <span>
                  Зараз {totalSize}/{maxMembers}. Додайте ще {minMembers - totalSize} учасника(ів).
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-5 border-t border-[#dadadc] bg-[#eeeeef] px-6 py-7 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !isAuthenticated || totalSize < minMembers}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#5f72df] px-7 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(95,114,223,0.24)] transition hover:bg-[#5366d5] disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
              {isSubmitting ? "Реєструємо…" : "Зареєструвати команду"}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </main>
  );
}
