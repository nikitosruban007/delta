"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Loader2 } from "lucide-react";

import { notificationsApi } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

function timeAgo(iso: string): string {
  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) return "";
  const diff = Math.max(0, Date.now() - created);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "щойно";
  if (m < 60) return `${m} хв тому`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} год тому`;
  const d = Math.floor(h / 24);
  return `${d} дн тому`;
}

export function NotificationsBell() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => notificationsApi.list(user!.id, token!),
    enabled: Boolean(user?.id && token),
    refetchInterval: 30_000,
  });

  const items = data?.notifications ?? [];
  const unread = items.filter((n) => !n.isRead);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center rounded-full p-2 text-white transition hover:bg-white/10"
        aria-label="Сповіщення"
      >
        <Bell className="size-5" />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-bold text-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[360px] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white text-[#161616] shadow-xl">
          <div className="flex items-center justify-between border-b border-[#eee] bg-[#f5f7ff] px-4 py-3">
            <p className="text-sm font-semibold text-[#111]">Сповіщення</p>
            {isFetching && <Loader2 className="size-4 animate-spin text-[#5f72df]" />}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[#666]">
              Поки що немає сповіщень.
            </p>
          ) : (
            <ul className="max-h-[400px] overflow-y-auto">
              {items.slice(0, 8).map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-[#f1f1f1] px-4 py-3 last:border-b-0 ${
                    n.isRead ? "bg-white" : "bg-[#eef2ff]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111]">
                        {n.subject || "Сповіщення"}
                      </p>
                      {n.body && (
                        <p className="mt-1 line-clamp-2 text-xs text-[#5b5f69]">{n.body}</p>
                      )}
                      <p className="mt-1 text-[11px] text-[#999]">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markReadMutation.mutate(n.id)}
                        disabled={markReadMutation.isPending}
                        title="Позначити прочитаним"
                        className="rounded-md p-1 text-[#5f72df] transition hover:bg-[#dbe4ff] disabled:opacity-50"
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-[#eee] bg-[#fafbff] px-4 py-2 text-right">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#5f72df] hover:underline"
            >
              Усі сповіщення →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
