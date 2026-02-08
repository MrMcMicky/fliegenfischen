"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ContactRequestStatus } from "@prisma/client";

import { formatDate } from "@/lib/format";
import { deleteContactRequest, updateContactStatus } from "./actions";

type ContactRequestRow = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactRequestStatus;
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

export default function ContactRequestsTable({
  rows: initialRows,
}: {
  rows: ContactRequestRow[];
}) {
  const [rows, setRows] = useState<ContactRequestRow[]>(initialRows);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("OPEN");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!openActionMenuId && !openStatusMenuId) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openStatusMenuId && target.closest(`[data-status-menu="${openStatusMenuId}"]`)) {
        return;
      }
      if (target.closest(`[data-action-menu="${openActionMenuId}"]`)) {
        return;
      }
      setOpenStatusMenuId(null);
      setOpenActionMenuId(null);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [openActionMenuId, openStatusMenuId]);

  useEffect(() => {
    if (saveState !== "saved") return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      setSaveState("idle");
    }, 2000);
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [saveState]);

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
      if (statusFilter !== "ALL" && row.status !== statusFilter) {
        return false;
      }
      if (!trimmed) return true;
      const haystack = [
        row.name,
        row.email,
        row.phone || "",
        row.subject || "",
        row.message,
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

  const closeDrawer = () => {
    setActiveRowId(null);
    setOpenStatusMenuId(null);
    setOpenActionMenuId(null);
    setSaveState("idle");
  };

  const handleStatusChange = (id: string, status: ContactRequestStatus) => {
    const previousStatus = rows.find((row) => row.id === id)?.status;
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status } : row))
    );
    setPendingId(id);
    setSaveState("saving");
    setOpenStatusMenuId(null);
    startTransition(async () => {
      const result = await updateContactStatus(id, status);
      if (!result.ok && previousStatus) {
        setRows((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, status: previousStatus } : row
          )
        );
        setSaveState("error");
      } else {
        setSaveState("saved");
      }
      setPendingId((current) => (current === id ? null : current));
    });
  };

  const openDrawerForRow = (id: string) => {
    setOpenActionMenuId(null);
    setOpenStatusMenuId(null);
    setActiveRowId(id);
    setSaveState("idle");
  };

  const handleDeleteRequest = (id: string) => {
    if (!window.confirm("Anfrage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      return;
    }
    setDeletePendingId(id);
    startTransition(async () => {
      const result = await deleteContactRequest(id);
      if (result.ok) {
        setRows((prev) => prev.filter((row) => row.id !== id));
        if (activeRowId === id) {
          closeDrawer();
        }
      }
      setDeletePendingId((current) => (current === id ? null : current));
      setOpenActionMenuId((current) => (current === id ? null : current));
    });
  };

  const saveLabel =
    saveState === "saving"
      ? "Speichert…"
      : saveState === "saved"
        ? "Gespeichert"
        : saveState === "error"
          ? "Fehler"
          : "Bereit";

  const exportStatus = statusFilter === "ALL" ? "ALL" : statusFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Kontaktanfragen</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Alle Anfragen aus dem Kontaktformular.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          <a
            href={`/api/admin/contact-requests/export?status=${exportStatus}`}
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-[var(--color-forest)]"
          >
            CSV exportieren
          </a>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Suche nach Name, E-Mail oder Betreff"
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
        <div className="hidden lg:grid grid-cols-[110px_minmax(220px,1.2fr)_minmax(260px,2fr)_140px_140px] items-center gap-3 bg-[var(--color-stone)] px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          <span>Datum</span>
          <span>Kunde</span>
          <span>Betreff / Nachricht</span>
          <span>Status</span>
          <span className="text-left">Aktionen</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {filteredRows.map((row) => (
            <div
              key={row.id}
              className="group grid items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm transition hover:border-[var(--color-ember)] hover:bg-[var(--color-stone)]/70 lg:grid-cols-[110px_minmax(220px,1.2fr)_minmax(260px,2fr)_140px_140px]"
            >
              <button
                type="button"
                onClick={() => openDrawerForRow(row.id)}
                className="text-left text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                {formatDate(row.createdAt)}
              </button>
              <button
                type="button"
                onClick={() => openDrawerForRow(row.id)}
                className="min-w-0 text-left"
              >
                <p className="truncate font-semibold text-[var(--color-text)]">
                  {row.name} ·{" "}
                  <span className="font-normal text-[var(--color-muted)]">
                    {row.email}
                  </span>
                </p>
                {row.phone ? (
                  <p className="truncate text-xs text-[var(--color-muted)]">
                    {row.phone}
                  </p>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => openDrawerForRow(row.id)}
                className="min-w-0 text-left"
              >
                <p className="truncate text-[var(--color-text)]">
                  {row.subject?.trim() || "Kontaktanfrage"} ·{" "}
                  <span className="text-[var(--color-muted)]">
                    {row.message}
                  </span>
                </p>
              </button>
              <div
                className="relative flex items-center gap-2"
                data-status-menu={row.id}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenStatusMenuId((current) => (current === row.id ? null : row.id))
                  }
                  className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPillClasses[row.status]}`}
                >
                  {statusLabels[row.status]} <span className="text-[10px]">▾</span>
                </button>
                {openStatusMenuId === row.id ? (
                  <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-[var(--color-border)] bg-white p-2 text-xs shadow-xl">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleStatusChange(row.id, option.value)}
                        className={`w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)] ${
                          row.status === option.value
                            ? "bg-[var(--color-stone)] font-semibold"
                            : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {pendingId === row.id ? (
                  <span className="text-[11px] text-[var(--color-ember)]">
                    Speichert…
                  </span>
                ) : null}
              </div>
              <div
                className="relative flex items-center justify-start"
                data-action-menu={row.id}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenActionMenuId((current) => (current === row.id ? null : row.id))
                  }
                  className="rounded-full border border-[var(--color-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text)] opacity-80 transition hover:shadow group-hover:opacity-100"
                >
                  Aktionen ▾
                </button>
                {openActionMenuId === row.id ? (
                  <div className="absolute left-0 top-12 z-20 w-56 rounded-xl border border-[var(--color-border)] bg-white p-2 text-xs shadow-xl">
                    <a
                      href={`mailto:${row.email}?subject=${encodeURIComponent(
                        row.subject || "Kontaktanfrage"
                      )}`}
                      className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)]"
                      onClick={() => setOpenActionMenuId(null)}
                    >
                      Antwort per E-Mail
                    </a>
                    {row.phone ? (
                      <a
                        href={`tel:${row.phone}`}
                        className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)]"
                        onClick={() => setOpenActionMenuId(null)}
                      >
                        Anrufen
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(row.id)}
                      className="w-full rounded-lg px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                    >
                      {deletePendingId === row.id ? "Löscht..." : "Eintrag löschen"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {!filteredRows.length ? (
            <div className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
              Keine Anfragen für diesen Filter.
            </div>
          ) : null}
        </div>
      </div>

      {activeRow ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Kontaktanfrage · {formatDate(activeRow.createdAt)}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
                  {activeRow.name}
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {activeRow.email}
                  {activeRow.phone ? ` · ${activeRow.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {saveLabel}
                </span>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text)]"
                >
                  Schliessen
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <section className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Status
                  </p>
                  <div className="relative mt-3">
                    <select
                      value={activeRow.status}
                      onChange={(event) =>
                        handleStatusChange(
                          activeRow.id,
                          event.target.value as ContactRequestStatus
                        )
                      }
                      className="appearance-none w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                      disabled={isPending}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-muted)]">
                      ▾
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Status wird automatisch gespeichert.
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Aktionen
                  </p>
                  <div className="relative mt-3" data-action-menu="drawer-actions">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenActionMenuId((current) =>
                          current === "drawer-actions" ? null : "drawer-actions"
                        )
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                    >
                      Auswahl
                      <span className="text-[10px]">▾</span>
                    </button>
                    {openActionMenuId === "drawer-actions" ? (
                      <div className="absolute left-0 z-10 mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white p-2 text-xs shadow-lg">
                        <a
                          href={`mailto:${activeRow.email}?subject=${encodeURIComponent(
                            activeRow.subject || "Kontaktanfrage"
                          )}`}
                          className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)]"
                          onClick={() => setOpenActionMenuId(null)}
                        >
                          Antwort per E-Mail
                        </a>
                        {activeRow.phone ? (
                          <a
                            href={`tel:${activeRow.phone}`}
                            className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)]"
                            onClick={() => setOpenActionMenuId(null)}
                          >
                            Anrufen
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(activeRow.id)}
                          className="w-full rounded-lg px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                        >
                          {deletePendingId === activeRow.id ? "Löscht..." : "Eintrag löschen"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Name
                  </label>
                  <input
                    value={activeRow.name}
                    readOnly
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    E-Mail
                  </label>
                  <input
                    value={activeRow.email}
                    readOnly
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Telefon
                  </label>
                  <input
                    value={activeRow.phone || ""}
                    readOnly
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Betreff
                  </label>
                  <input
                    value={activeRow.subject || "Kontaktanfrage"}
                    readOnly
                    className="form-input w-full px-3 py-2"
                  />
                </div>
              </section>

              <section className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Nachricht
                </label>
                <textarea
                  value={activeRow.message}
                  readOnly
                  rows={8}
                  className="form-textarea w-full px-3 py-2"
                />
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
