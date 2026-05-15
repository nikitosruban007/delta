"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, X } from "lucide-react";

import { criteriaApi, tournamentsApi, type Criterion } from "@/lib/api";

type DraftCriterion = {
  title: string;
  description: string;
  maxScore: string;
  weight: string;
  roundId: string;
  parentId: string | null;
};

const emptyDraft: DraftCriterion = {
  title: "",
  description: "",
  maxScore: "100",
  weight: "1",
  roundId: "",
  parentId: null,
};

export function CriteriaEditor({
  tournamentId,
  token,
}: {
  tournamentId: string;
  token: string;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<DraftCriterion>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  const { data: criteria = [], isLoading } = useQuery({
    queryKey: ["criteria", tournamentId],
    queryFn: () => criteriaApi.list(tournamentId, token),
    enabled: Boolean(token),
  });

  const { data: rounds = [] } = useQuery({
    queryKey: ["tournament-rounds", tournamentId],
    queryFn: () => tournamentsApi.getRounds(tournamentId, token),
    enabled: Boolean(token),
  });

  const parents = criteria.filter((c) => c.parentId === null);
  const childrenOf = (parentId: string) =>
    criteria.filter((c) => c.parentId === parentId);

  const createMutation = useMutation({
    mutationFn: () => {
      if (!draft.title.trim()) throw new Error("Назва критерію обов’язкова");
      return criteriaApi.create(
        tournamentId,
        {
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
          maxScore: draft.maxScore ? Number(draft.maxScore) : undefined,
          weight: draft.weight ? Number(draft.weight) : undefined,
          roundId: draft.roundId ? Number(draft.roundId) : undefined,
          parentId: draft.parentId ? Number(draft.parentId) : undefined,
        },
        token,
      );
    },
    onSuccess: () => {
      setDraft(emptyDraft);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["criteria", tournamentId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (criterionId: string) => criteriaApi.remove(tournamentId, criterionId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria", tournamentId] });
    },
  });

  const renderCriterion = (c: Criterion, isChild = false) => {
    const roundName = c.roundId
      ? rounds.find((r) => r.id === c.roundId)?.title ?? `Раунд ${c.roundId}`
      : "Весь турнір";
    return (
      <div
        key={c.id}
        className={`flex items-center justify-between rounded-lg border border-[#e6e8ef] bg-white px-4 py-3 ${
          isChild ? "ml-6 bg-[#fbfcff]" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-[#111]">{c.title}</p>
            <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-[10px] font-semibold text-[#3f4b73]">
              max {c.maxScore}
            </span>
            <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#9a3412]">
              w {c.weight}
            </span>
            <span className="text-[11px] text-[#888]">{roundName}</span>
          </div>
          {c.description && (
            <p className="mt-1 text-[12px] text-[#5b5f69]">{c.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Видалити критерій "${c.title}"?`)) {
              removeMutation.mutate(c.id);
            }
          }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#a0263c] transition hover:bg-red-50"
        >
          <Trash2 className="size-3.5" />
          Видалити
        </button>
      </div>
    );
  };

  return (
    <section className="rounded-[12px] border border-[#dadce5] bg-[#fafbff] p-5 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#111]">Критерії оцінювання</h3>
          <p className="text-xs text-[#5b5f69]">
            Журі ставить оцінки 0–{draft.maxScore || 100} по кожному критерію. Можна додати підкритерії.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-6 animate-spin text-[#5f72df]" />
        </div>
      ) : parents.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#cbd1e2] bg-white px-4 py-6 text-center text-sm text-[#5b5f69]">
          Ще немає критеріїв. Додайте перший нижче.
        </p>
      ) : (
        <div className="space-y-2">
          {parents.map((parent) => (
            <div key={parent.id} className="space-y-1">
              {renderCriterion(parent)}
              {childrenOf(parent.id).map((child) => renderCriterion(child, true))}
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      <div className="mt-5 rounded-lg border border-[#c7c9d1] bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-[#111]">Додати критерій</p>
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Назва критерію"
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df]"
          />
          <select
            value={draft.parentId ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, parentId: e.target.value === "" ? null : e.target.value })
            }
            className="rounded-md border border-[#c7c9d1] bg-white px-3 py-2 text-sm outline-none focus:border-[#5f72df]"
          >
            <option value="">Самостійний критерій</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                Підкритерій → {p.title}
              </option>
            ))}
          </select>
          <input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder="Опис (опційно)"
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df] md:col-span-2"
          />
          <input
            type="number"
            min={1}
            max={1000}
            value={draft.maxScore}
            onChange={(e) => setDraft({ ...draft, maxScore: e.target.value })}
            placeholder="Максимум (0–100 за замовч.)"
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df]"
          />
          <input
            type="number"
            min={0}
            step={0.1}
            value={draft.weight}
            onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
            placeholder="Вага"
            className="rounded-md border border-[#c7c9d1] px-3 py-2 text-sm outline-none focus:border-[#5f72df]"
          />
          <select
            value={draft.roundId}
            onChange={(e) => setDraft({ ...draft, roundId: e.target.value })}
            className="rounded-md border border-[#c7c9d1] bg-white px-3 py-2 text-sm outline-none focus:border-[#5f72df] md:col-span-2"
          >
            <option value="">Весь турнір (всі тури)</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {draft.title || draft.description ? (
            <button
              type="button"
              onClick={() => setDraft(emptyDraft)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-xs text-[#666] transition hover:bg-[#f5f5f5]"
            >
              <X className="size-3.5" />
              Очистити
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !draft.title.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-[#5f72df] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4d63cd] disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Додати критерій
          </button>
        </div>
      </div>
    </section>
  );
}
