"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Loader2 } from "lucide-react";

import Footer from "@/components/shared/Footer";
import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => notificationsApi.list(user!.id, token!),
    enabled: Boolean(user?.id && token),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => notificationsApi.markRead(id, token!)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <Loader2 size={40} className="animate-spin text-[#6082e6]" />
      </div>
    );
  }

  const items = data?.notifications ?? [];
  const unread = items.filter((n) => !n.isRead);

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
          <Bell className="size-5" />
          <span className="text-[24px] font-semibold tracking-wide">Сповіщення</span>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[900px] flex-1 px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[24px] font-semibold text-[#111]">
            {items.length} {items.length === 1 ? "повідомлення" : "повідомлень"}
            {unread.length > 0 && (
              <span className="ml-3 rounded-full bg-[#dc2626] px-2 py-0.5 text-xs font-bold text-white">
                {unread.length} нових
              </span>
            )}
          </h1>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={() => markAllMutation.mutate(unread.map((n) => n.id))}
              disabled={markAllMutation.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-[#5f72df] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4d63cd] disabled:opacity-60"
            >
              {markAllMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Позначити всі прочитаними
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={32} className="animate-spin text-[#6082e6]" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-[#E0E0E0] bg-white px-6 py-10 text-center text-sm text-[#666]">
            Поки що немає сповіщень.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border px-5 py-4 shadow-sm transition ${
                  n.isRead
                    ? "border-[#E0E0E0] bg-white"
                    : "border-[#5f72df]/30 bg-[#eef2ff]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111]">
                      {n.subject || "Сповіщення"}
                    </p>
                    {n.body && (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-[#444]">{n.body}</p>
                    )}
                    <p className="mt-2 text-[11px] text-[#999]">
                      {new Date(n.createdAt).toLocaleString("uk-UA")}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markReadMutation.mutate(n.id)}
                      disabled={markReadMutation.isPending}
                      className="inline-flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#5f72df] transition hover:bg-[#dbe4ff] disabled:opacity-50"
                    >
                      <Check className="size-3.5" />
                      Прочитано
                    </button>
                  )}
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
