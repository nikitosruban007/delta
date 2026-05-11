"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Archive, Loader2, Search } from "lucide-react";

import { useLanguage } from "@/contexts/language-context";
import { tournamentsApi, type Tournament } from "@/lib/api";
import Footer from "@/components/shared/Footer";

export default function ArchivePage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["tournaments", "finished"],
    queryFn: () => tournamentsApi.list("finished"),
  });

  const items = (data ?? []).filter((tour: Tournament) =>
    search ? tour.title.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <main className="flex min-h-screen flex-col bg-[#F4F8FB] font-sans text-[#161616]">
      <header className="flex h-[72px] items-center justify-between bg-[#1B345B] px-8 text-white shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-[#E4EDFA] px-5 py-2.5 text-[14px] font-semibold text-[#1B345B] transition hover:bg-[#d0e0f5]"
        >
          <span className="text-lg leading-none">←</span> {t("nav.dashboard")}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[24px] font-semibold tracking-wide">FoldUp</span>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1200px] flex-1 px-8 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Archive size={28} className="text-[#1B345B]" />
          <h1 className="text-[28px] font-bold text-[#111]">{t("dashboard.sidebar.archive")}</h1>
        </div>

        <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#E0E0E0] bg-white px-4 py-2.5 shadow-sm">
          <Search size={18} className="text-[#888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#999]"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-10 animate-spin text-[#0E274A]" />
          </div>
        ) : error ? (
          <p className="text-[#E06C75]">{(error as Error).message}</p>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-[#E0E0E0] bg-white px-6 py-10 text-center text-[14px] text-[#666]">
            {t("common.nothing_found")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((tour) => (
              <div
                key={tour.id}
                className="flex h-full flex-col overflow-hidden rounded-[16px] border border-[#E0E0E0] bg-white shadow-sm"
              >
                <div className="bg-[#636363] px-5 py-4">
                  <h3 className="text-[14px] font-semibold text-white">{tour.title}</h3>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="line-clamp-3 text-[12px] leading-relaxed text-[#444]">
                    {tour.description ?? ""}
                  </p>
                  <div className="mt-auto flex items-end justify-between pt-6">
                    <span className="inline-block rounded-full bg-[#636363] px-4 py-1.5 text-[10px] font-semibold text-white">
                      {t("dashboard.tabs.finished")}
                    </span>
                    <Link
                      href={`/tournaments/${tour.id}`}
                      className="inline-block rounded-full bg-[#636363] px-5 py-2 text-[11px] font-semibold text-white transition hover:opacity-90"
                    >
                      {t("dashboard.tournament.go_to")} →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
