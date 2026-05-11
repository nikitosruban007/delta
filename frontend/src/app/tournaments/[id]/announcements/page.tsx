"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Megaphone, Send } from "lucide-react";

import BrandMark from "@/components/shared/BrandMark";
import Footer from "@/components/shared/Footer";
import { announcementsApi, tournamentsApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function TournamentAnnouncementsPage() {
  const params = useParams<{ id: string }>();
  const tournamentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token, user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const canPost =
    Boolean(token) &&
    (hasRole("ADMIN") || hasRole("ORGANIZER"));

  const { data: tournament } = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => tournamentsApi.getById(tournamentId),
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements", tournamentId],
    queryFn: () => announcementsApi.list(tournamentId, token),
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const isOwner =
    canPost && (hasRole("ADMIN") || (user && tournament?.organizerId === user.id));

  const createMutation = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Not authenticated");
      return announcementsApi.create(
        { tournamentId, title: title.trim(), body: body.trim() },
        token,
      );
    },
    onSuccess: () => {
      setTitle("");
      setBody("");
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ["announcements", tournamentId] });
    },
    onError: (err) => {
      setServerError(err instanceof ApiError ? err.message : (err as Error).message);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setServerError("Заголовок та текст обов'язкові");
      return;
    }
    createMutation.mutate();
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f5f6] text-[#111111]">
      <header className="bg-[#0b3372]">
        <div className="mx-auto flex min-h-[84px] w-full max-w-[1440px] items-center justify-between gap-5 px-5 md:px-12">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="inline-flex items-center gap-2 rounded-[8px] bg-[#d8e8ff] px-4 py-2 text-sm font-semibold text-[#0a3268] transition hover:bg-[#e6f0ff]"
          >
            <ArrowLeft className="size-4" /> Повернутися
          </Link>
          <BrandMark />
        </div>
      </header>

      <section className="mx-auto w-full max-w-[920px] flex-1 px-5 py-10 md:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Megaphone className="size-7 text-[#5f72df]" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f72df]">
              {tournament?.title ?? "Турнір"}
            </p>
            <h1 className="text-3xl font-semibold">Оголошення</h1>
          </div>
        </div>

        {isOwner && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-[12px] border border-[#d6d6d9] bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-semibold">Опублікувати оголошення</h2>
            {serverError && (
              <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </p>
            )}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок"
              required
              minLength={3}
              maxLength={200}
              className="mb-3 w-full rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Текст оголошення"
              required
              minLength={1}
              maxLength={20000}
              rows={5}
              className="mb-3 w-full resize-y rounded-[8px] border border-[#c7c9d1] px-4 py-2.5 text-sm outline-none focus:border-[#5f72df]"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#5f72df] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4d63cd] disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Опублікувати
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-[#5f72df]" />
          </div>
        ) : !announcements || announcements.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-[#cfd5ea] bg-white px-6 py-10 text-center text-[#6b6f7c]">
            Поки що немає оголошень.
          </p>
        ) : (
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-[12px] border border-[#dce4f0] bg-white p-6 shadow-sm"
              >
                <h3 className="mb-2 text-xl font-semibold text-[#101724]">{a.title}</h3>
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#32333a]">
                  {a.body}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-[#6b6f7c]">
                  <span>{a.author?.name ?? "—"}</span>
                  <time>{new Date(a.createdAt).toLocaleString("uk-UA")}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Footer />
    </main>
  );
}
