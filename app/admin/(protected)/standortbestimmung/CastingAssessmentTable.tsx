"use client";

import { useMemo, useState, useTransition } from "react";
import type { ContactRequestStatus } from "@prisma/client";

import { formatDate } from "@/lib/format";
import {
  updateCastingAssessmentNotes,
  updateCastingAssessmentStatus,
} from "./actions";

type AnswerRow = {
  questionId: string;
  question: string;
  optionId: string;
  answer: string;
  score: number;
};

type CastingAssessmentRow = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  score: number;
  levelKey: string;
  levelTitle: string;
  recommendation: string;
  goal: string | null;
  answers: unknown;
  status: ContactRequestStatus;
  adminNotes: string | null;
};

type StatusFilter = "ALL" | ContactRequestStatus;
type SaveState = "idle" | "saving" | "saved" | "error";

const statusLabels: Record<ContactRequestStatus, string> = {
  OPEN: "Neu",
  DONE: "Erledigt",
  ARCHIVED: "Archiv",
};

const statusOptions: { value: ContactRequestStatus; label: string }[] = [
  { value: "OPEN", label: "Neu" },
  { value: "DONE", label: "Erledigt" },
  { value: "ARCHIVED", label: "Archiv" },
];

const statusPillClasses: Record<ContactRequestStatus, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  DONE: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-gray-200 text-gray-700",
};

const normalizeAnswers = (value: unknown): AnswerRow[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is AnswerRow => {
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    return (
      typeof record.question === "string" &&
      typeof record.answer === "string" &&
      typeof record.score === "number"
    );
  });
};

export default function CastingAssessmentTable({
  rows: initialRows,
}: {
  rows: CastingAssessmentRow[];
}) {
  const [rows, setRows] = useState<CastingAssessmentRow[]>(initialRows);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("OPEN");
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isPending, startTransition] = useTransition();

  const statusCounts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      ALL: rows.length,
      OPEN: 0,
      DONE: 0,
      ARCHIVED: 0,
    };
    rows.forEach((row) => {
      base[row.status] = (base[row.status] || 0) + 1;
    });
    return base;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (!trimmed) return true;
      const haystack = [
        row.name,
        row.email,
        row.phone || "",
        row.levelTitle,
        row.goal || "",
        row.recommendation,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [rows, query, statusFilter]);

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeRowId) || null,
    [rows, activeRowId]
  );

  const activeAnswers = normalizeAnswers(activeRow?.answers);

  const openDrawer = (row: CastingAssessmentRow) => {
    setActiveRowId(row.id);
    setNotesDraft(row.adminNotes || "");
    setSaveState("idle");
  };

  const updateStatus = (id: string, status: ContactRequestStatus) => {
    const previousStatus = rows.find((row) => row.id === id)?.status;
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    setPendingId(id);
    startTransition(async () => {
      const result = await updateCastingAssessmentStatus(id, status);
      if (!result.ok && previousStatus) {
        setRows((prev) =>
          prev.map((row) => (row.id === id ? { ...row, status: previousStatus } : row))
        );
      }
      setPendingId((current) => (current === id ? null : current));
    });
  };

  const saveNotes = () => {
    if (!activeRow) return;
    const id = activeRow.id;
    const value = notesDraft;
    setSaveState("saving");
    startTransition(async () => {
      const result = await updateCastingAssessmentNotes(id, value);
      if (result.ok) {
        setRows((prev) =>
          prev.map((row) => (row.id === id ? { ...row, adminNotes: value.trim() || null } : row))
        );
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    });
  };

  const saveLabel =
    saveState === "saving"
      ? "Speichert..."
      : saveState === "saved"
        ? "Gespeichert"
        : saveState === "error"
          ? "Fehler"
          : "Notiz speichern";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Standortbestimmungen</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Ergebnisse aus dem Self-Test zum Fliegenwerfen.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Suche nach Name, E-Mail, Ziel oder Ergebnis"
          className="form-input w-full max-w-sm px-3 py-2 text-sm"
        />
        <p className="text-xs text-[var(--color-muted)]">
          Status wird automatisch gespeichert.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
        {[
          { label: "Neu", value: "OPEN" as StatusFilter },
          { label: "Erledigt", value: "DONE" as StatusFilter },
          { label: "Archiv", value: "ARCHIVED" as StatusFilter },
          { label: "Alle", value: "ALL" as StatusFilter },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-full border px-4 py-2 ${
              statusFilter === tab.value
                ? "border-transparent bg-[var(--color-forest)] text-white"
                : "border-[var(--color-border)] bg-white text-[var(--color-forest)]"
            }`}
          >
            {tab.label} · {statusCounts[tab.value]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
        <div className="hidden grid-cols-[110px_minmax(210px,1fr)_120px_minmax(220px,1.2fr)_130px] items-center gap-3 bg-[var(--color-stone)] px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)] lg:grid">
          <span>Datum</span>
          <span>Kontakt</span>
          <span>Score</span>
          <span>Ergebnis</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {filteredRows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => openDrawer(row)}
              className="grid w-full items-center gap-3 px-4 py-4 text-left text-sm transition hover:bg-[var(--color-stone)]/70 lg:grid-cols-[110px_minmax(210px,1fr)_120px_minmax(220px,1.2fr)_130px]"
            >
              <span className="text-xs text-[var(--color-muted)]">{formatDate(row.createdAt)}</span>
              <span>
                <span className="block font-semibold text-[var(--color-text)]">{row.name}</span>
                <span className="block text-xs text-[var(--color-muted)]">{row.email}</span>
              </span>
              <span className="font-semibold text-[var(--color-text)]">{row.score}/24</span>
              <span>
                <span className="block font-semibold text-[var(--color-text)]">{row.levelTitle}</span>
                {row.goal ? <span className="block text-xs text-[var(--color-muted)]">{row.goal}</span> : null}
              </span>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusPillClasses[row.status]}`}>
                {statusLabels[row.status]}
              </span>
            </button>
          ))}
          {!filteredRows.length ? (
            <div className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
              Keine Standortbestimmungen für diesen Filter.
            </div>
          ) : null}
        </div>
      </div>

      {activeRow ? (
        <div className="fixed inset-0 z-[80] bg-black/30" onClick={() => setActiveRowId(null)}>
          <div
            className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[var(--color-border)] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-forest)]/60">
                    Standortbestimmung · {formatDate(activeRow.createdAt)}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--color-text)]">
                    {activeRow.name}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {activeRow.email}{activeRow.phone ? ` · ${activeRow.phone}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRowId(null)}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm"
                >
                  Schliessen
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="rounded-2xl bg-[var(--color-river-mist)] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-forest)]/60">
                  {activeRow.score}/24 Punkte
                </p>
                <h4 className="mt-2 text-xl font-semibold text-[var(--color-text)]">
                  {activeRow.levelTitle}
                </h4>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  {activeRow.recommendation}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateStatus(activeRow.id, option.value)}
                    disabled={pendingId === activeRow.id || isPending}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                      activeRow.status === option.value
                        ? "border-transparent bg-[var(--color-forest)] text-white"
                        : "border-[var(--color-border)] bg-white text-[var(--color-forest)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-[var(--color-text)]">Antworten</h4>
                <div className="mt-3 space-y-3">
                  {activeAnswers.map((answer) => (
                    <div key={answer.questionId} className="rounded-xl border border-[var(--color-border)] p-4">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{answer.question}</p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {answer.answer} · {answer.score} Punkte
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="assessment-notes">
                  Admin-Notiz
                </label>
                <textarea
                  id="assessment-notes"
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  rows={5}
                  className="form-input mt-2 w-full"
                  placeholder="Gesprächsnotiz, Rückruf, Terminidee..."
                />
                <button
                  type="button"
                  onClick={saveNotes}
                  disabled={saveState === "saving" || isPending}
                  className="mt-3 rounded-full bg-[var(--color-forest)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saveLabel}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <a className="text-[var(--color-ember)]" href={`mailto:${activeRow.email}?subject=Standortbestimmung im Fliegenwerfen`}>
                  E-Mail schreiben
                </a>
                {activeRow.phone ? <a className="text-[var(--color-ember)]" href={`tel:${activeRow.phone}`}>Anrufen</a> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
