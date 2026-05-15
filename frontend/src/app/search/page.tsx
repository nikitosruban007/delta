"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search as SearchIcon, MessageSquare, Trophy, User } from "lucide-react";

import Footer from "@/components/shared/Footer";
import { searchApi } from "@/lib/api";

type Tab = "all" | "tournaments" | "topics" | "users";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const initialType = (searchParams.get("type") as Tab) ?? "all";

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [tab, setTab] = useState<Tab>(initialType);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (tab !== "all") params.set("type", tab);
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : "/search");
  }, [debouncedQuery, tab, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery, tab],
    queryFn: () => searchApi.search(debouncedQuery, tab, 25),
    enabled: debouncedQuery.length >= 2,
  });

  const tournaments = data?.tournaments ?? [];
  const topics = data?.topics ?? [];
  const users = data?.users ?? [];
  const totalCount = tournaments.length + topics.length + users.length;

  return (
    <main className="flex min-h-screen flex-col bg-[#F4F7FB] font-sans text-[#161616]">
      <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
        >
          <span className="text-lg leading-none">←</span> Дашборд
        </Link>
        <span className="text-[24px] font-semibold tracking-wide">Пошук</span>
      </header>

      <section className="mx-auto w-full max-w-[1100px] flex-1 px-8 py-10">
        <div className="flex items-center gap-2 rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 shadow-sm">
          <SearchIcon size={20} className="text-[#888]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Шукати турніри, теми форуму, користувачів…"
            className="w-full bg-transparent text-base outline-none placeholder:text-[#999]"
          />
          {isLoading && <Loader2 size={18} className="animate-spin text-[#6082e6]" />}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "Все"],
              ["tournaments", "Турніри"],
              ["topics", "Форум"],
              ["users", "Користувачі"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === key
                  ? "bg-[#1B345B] text-white"
                  : "bg-white text-[#1B345B] hover:bg-[#e4edfa]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {debouncedQuery.length < 2 ? (
          <p className="mt-10 text-center text-sm text-[#666]">
            Введіть щонайменше 2 символи для пошуку.
          </p>
        ) : totalCount === 0 && !isLoading ? (
          <p className="mt-10 text-center text-sm text-[#666]">
            За запитом «{debouncedQuery}» нічого не знайдено.
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {(tab === "all" || tab === "tournaments") && tournaments.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                  <Trophy size={16} /> Турніри ({tournaments.length})
                </h2>
                <div className="space-y-2">
                  {tournaments.map((t) => (
                    <Link
                      key={t.id}
                      href={`/tournaments/${t.id}`}
                      className="block rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 shadow-sm transition hover:border-[#5f72df]"
                    >
                      <div className="flex items-center gap-2">
                        <p className="flex-1 font-semibold text-[#111]">{t.title}</p>
                        {t.status && (
                          <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold text-[#3f4b73]">
                            {t.status}
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-[#666]">{t.description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(tab === "all" || tab === "topics") && topics.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                  <MessageSquare size={16} /> Форум ({topics.length})
                </h2>
                <div className="space-y-2">
                  {topics.map((t) => (
                    <Link
                      key={t.id}
                      href={`/forum/${t.id}`}
                      className="block rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 shadow-sm transition hover:border-[#5f72df]"
                    >
                      <p className="font-semibold text-[#111]">{t.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#666]">
                        {t.category && <span>в {t.category.title}</span>}
                        {t.author && <span>{t.author.name}</span>}
                        {t.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-[#F5F5F5] px-2 py-0.5 text-[11px] font-medium text-[#666]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(tab === "all" || tab === "users") && users.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#5b5f69]">
                  <User size={16} /> Користувачі ({users.length})
                </h2>
                <div className="grid gap-2 md:grid-cols-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 shadow-sm"
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] text-sm font-bold text-[#5f72df]">
                          {u.name[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div className="min-w-0 text-sm">
                        <p className="font-semibold text-[#111]">
                          {u.name}
                          {u.username && (
                            <span className="ml-2 text-xs font-normal text-[#888]">
                              @{u.username}
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-[#666]">{u.email}</p>
                      </div>
                    </div>
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
