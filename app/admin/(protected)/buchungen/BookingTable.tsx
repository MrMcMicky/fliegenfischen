"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { BookingStatus, BookingType, PaymentMode } from "@prisma/client";

import { bookingStatusLabels, bookingTypeLabels } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import {
  deleteBooking,
  resendBookingConfirmation,
  resendInvoiceEmail,
  updateBookingDetails,
  updateBookingStatus,
} from "./actions";

type BookingRow = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddressLine1?: string | null;
  customerAddressLine2?: string | null;
  customerPostalCode?: string | null;
  customerCity?: string | null;
  customerCountry?: string | null;
  notes?: string | null;
  amountCHF: number;
  status: BookingStatus;
  type: BookingType;
  paymentMode: PaymentMode;
  stripeConfirmed: boolean;
  title?: string | null;
};

type SortField = "date" | "customer" | "type" | "amount" | "status";
type SortDirection = "asc" | "desc";
type StatusFilter = "ALL" | BookingStatus;
type SaveState = "idle" | "saving" | "saved" | "error";

type BookingDraft = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddressLine1?: string | null;
  customerAddressLine2?: string | null;
  customerPostalCode?: string | null;
  customerCity?: string | null;
  customerCountry?: string | null;
  notes?: string | null;
};

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: "PENDING", label: "Offen" },
  { value: "PAYMENT_PENDING", label: "Zahlung offen" },
  { value: "PAID", label: "Bezahlt" },
  { value: "INVOICE_REQUESTED", label: "Rechnung angefragt" },
  { value: "CANCELLED", label: "Storniert" },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

export default function BookingTable({ rows: initialRows }: { rows: BookingRow[] }) {
  const [rows, setRows] = useState<BookingRow[]>(initialRows);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [invoicePendingId, setInvoicePendingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirmPendingId, setConfirmPendingId] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!openMenuId && !openActionMenuId) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openMenuId && target.closest(`[data-status-menu="${openMenuId}"]`)) {
        return;
      }
      if (
        openActionMenuId &&
        target.closest(`[data-action-menu="${openActionMenuId}"]`)
      ) {
        return;
      }
      setOpenMenuId(null);
      setOpenActionMenuId(null);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [openMenuId, openActionMenuId]);

  const statusCounts = useMemo(() => {
    const base: Record<StatusFilter, number> = {
      ALL: rows.length,
      PENDING: 0,
      PAYMENT_PENDING: 0,
      PAID: 0,
      INVOICE_REQUESTED: 0,
      CANCELLED: 0,
    };
    rows.forEach((row) => {
      base[row.status] = (base[row.status] || 0) + 1;
    });
    return base;
  }, [rows]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = rows.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      if (!term) return true;
      return (
        row.customerName.toLowerCase().includes(term) ||
        row.customerEmail.toLowerCase().includes(term) ||
        (row.title || "").toLowerCase().includes(term)
      );
    });

    const direction = sortDirection === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sortField === "date") {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          direction
        );
      }
      if (sortField === "amount") {
        return (a.amountCHF - b.amountCHF) * direction;
      }
      if (sortField === "customer") {
        return a.customerName.localeCompare(b.customerName) * direction;
      }
      if (sortField === "type") {
        const labelA = bookingTypeLabels[a.type] || a.type;
        const labelB = bookingTypeLabels[b.type] || b.type;
        return labelA.localeCompare(labelB) * direction;
      }
      const labelA = bookingStatusLabels[a.status] || a.status;
      const labelB = bookingStatusLabels[b.status] || b.status;
      return labelA.localeCompare(labelB) * direction;
    });
  }, [rows, query, sortField, sortDirection]);

  const activeRow = useMemo(
    () => rows.find((row) => row.id === activeRowId) || null,
    [rows, activeRowId]
  );

  const applyRowUpdate = (id: string, updates: Partial<BookingRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...updates } : row))
    );
  };

  const openDrawer = (row: BookingRow) => {
    setOpenActionMenuId(null);
    setOpenMenuId(null);
    const draftValue: BookingDraft = {
      id: row.id,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone || "",
      customerAddressLine1: row.customerAddressLine1 || "",
      customerAddressLine2: row.customerAddressLine2 || "",
      customerPostalCode: row.customerPostalCode || "",
      customerCity: row.customerCity || "",
      customerCountry: row.customerCountry || "",
      notes: row.notes || "",
    };
    setActiveRowId(row.id);
    setDraft(draftValue);
    lastSavedRef.current = JSON.stringify(draftValue);
    setSaveState("idle");
  };

  const closeDrawer = () => {
    setActiveRowId(null);
    setDraft(null);
    setSaveState("idle");
    setOpenMenuId(null);
    setOpenActionMenuId(null);
  };

  useEffect(() => {
    if (!draft) return;
    const serialized = JSON.stringify(draft);
    if (serialized === lastSavedRef.current) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveState("saving");
    saveTimerRef.current = setTimeout(async () => {
      const result = await updateBookingDetails(draft);
      if (result.ok) {
        lastSavedRef.current = serialized;
        setSaveState("saved");
        applyRowUpdate(draft.id, {
          customerName: draft.customerName,
          customerEmail: draft.customerEmail,
          customerPhone: draft.customerPhone,
          customerAddressLine1: draft.customerAddressLine1,
          customerAddressLine2: draft.customerAddressLine2,
          customerPostalCode: draft.customerPostalCode,
          customerCity: draft.customerCity,
          customerCountry: draft.customerCountry,
          notes: draft.notes,
        });
      } else {
        setSaveState("error");
      }
    }, 600);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [draft]);

  const handleHeaderSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection(field === "date" || field === "amount" ? "desc" : "asc");
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const handleStatusChange = (id: string, status: BookingStatus) => {
    const previousStatus = rows.find((row) => row.id === id)?.status;
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status } : row))
    );
    setPendingId(id);
    startTransition(async () => {
      const result = await updateBookingStatus(id, status);
      if (!result.ok && previousStatus) {
        setRows((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, status: previousStatus } : row
          )
        );
      }
      setPendingId((current) => (current === id ? null : current));
      setOpenMenuId((current) => (current === id ? null : current));
      setOpenActionMenuId((current) => (current === id ? null : current));
    });
  };

  const handleResendInvoice = (id: string) => {
    setInvoicePendingId(id);
    startTransition(async () => {
      await resendInvoiceEmail(id);
      setInvoicePendingId((current) => (current === id ? null : current));
      setOpenActionMenuId((current) => (current === id ? null : current));
    });
  };

  const handleResendConfirmation = (id: string) => {
    setConfirmPendingId(id);
    startTransition(async () => {
      await resendBookingConfirmation(id);
      setConfirmPendingId((current) => (current === id ? null : current));
      setOpenActionMenuId((current) => (current === id ? null : current));
    });
  };

  const handleDeleteBooking = (id: string) => {
    if (!window.confirm("Buchung wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      return;
    }
    setDeletePendingId(id);
    startTransition(async () => {
      const result = await deleteBooking(id);
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

  const updateDraftField = <K extends keyof BookingDraft>(
    field: K,
    value: BookingDraft[K]
  ) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const saveLabel =
    saveState === "saving"
      ? "Speichert…"
      : saveState === "saved"
        ? "Gespeichert"
        : saveState === "error"
          ? "Fehler"
          : "Bereit";

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Suche nach Name, E-Mail oder Kurs"
            className="form-input w-64 px-3 py-2 text-sm"
          />
          <p className="text-xs text-[var(--color-muted)]">
            Sortieren: Spaltenkopf anklicken · Status wird automatisch gespeichert.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          {[
            { label: "Alle", value: "ALL" as const },
            { label: "Offen", value: "PENDING" as const },
            { label: "Zahlung offen", value: "PAYMENT_PENDING" as const },
            { label: "Rechnung", value: "INVOICE_REQUESTED" as const },
            { label: "Bezahlt", value: "PAID" as const },
            { label: "Storniert", value: "CANCELLED" as const },
          ].map((filter) => {
            const isActive = statusFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full border px-3 py-1.5 text-[10px] transition ${
                  isActive
                    ? "border-[var(--color-forest)] bg-[var(--color-forest)] text-white"
                    : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-forest)]"
                }`}
              >
                {filter.label} · {statusCounts[filter.value]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
        <div className="hidden lg:grid grid-cols-[110px_minmax(240px,1.5fr)_minmax(220px,1.2fr)_90px_minmax(200px,1fr)_minmax(180px,1fr)] items-center gap-3 bg-[var(--color-stone)] px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          <button type="button" onClick={() => handleHeaderSort("date")} className="flex items-center gap-2 text-left">
            Datum <span className="text-[10px]">{getSortIndicator("date")}</span>
          </button>
          <button type="button" onClick={() => handleHeaderSort("customer")} className="flex items-center gap-2 text-left">
            Kunde <span className="text-[10px]">{getSortIndicator("customer")}</span>
          </button>
          <button type="button" onClick={() => handleHeaderSort("type")} className="flex items-center gap-2 text-left">
            Leistung <span className="text-[10px]">{getSortIndicator("type")}</span>
          </button>
          <button type="button" onClick={() => handleHeaderSort("amount")} className="flex items-center gap-2 text-left">
            Betrag <span className="text-[10px]">{getSortIndicator("amount")}</span>
          </button>
          <button type="button" onClick={() => handleHeaderSort("status")} className="flex items-center gap-2 text-left">
            Status <span className="text-[10px]">{getSortIndicator("status")}</span>
          </button>
          <span className="text-left">Aktionen</span>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {filteredRows.map((row) => {
            const isInvoice = row.paymentMode === "INVOICE";
            const isPendingRow = pendingId === row.id;
            const statusLabel = bookingStatusLabels[row.status] ?? row.status;
            const statusClass =
              row.status === "PAID"
                ? "bg-emerald-100 text-emerald-800"
              : row.status === "INVOICE_REQUESTED"
                ? "bg-amber-100 text-amber-800"
              : row.status === "PAYMENT_PENDING"
                ? "bg-blue-100 text-blue-800"
              : row.status === "CANCELLED"
                ? "bg-rose-100 text-rose-800"
              : "bg-gray-100 text-gray-700";
            return (
              <div
                key={row.id}
                onClick={() => openDrawer(row)}
                className="group grid cursor-pointer items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm transition hover:border-[var(--color-ember)] hover:bg-[var(--color-stone)]/70 lg:grid-cols-[110px_minmax(240px,1.5fr)_minmax(220px,1.2fr)_90px_minmax(200px,1fr)_minmax(180px,1fr)]"
              >
                <div className="text-xs text-[var(--color-muted)]">{formatDate(row.createdAt)}</div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--color-text)]">
                    {row.customerName} ·{" "}
                    <span className="font-normal text-[var(--color-muted)]">
                      {row.customerEmail}
                    </span>
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[var(--color-text)]">
                    {bookingTypeLabels[row.type] ?? row.type}
                    {row.title ? ` · ${row.title}` : ""}
                  </p>
                </div>
                <div className="font-semibold text-[var(--color-text)]">{formatPrice(row.amountCHF)}</div>
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="relative"
                    data-status-menu={row.id}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((current) => (current === row.id ? null : row.id))
                      }
                      className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
                    >
                      {statusLabel} <span className="text-[10px]">▾</span>
                    </button>
                    {openMenuId === row.id ? (
                      <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-white p-2 text-xs shadow-xl">
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
                  </div>
                  <span
                    className="text-[11px] text-[var(--color-muted)]"
                    title={
                      row.paymentMode === "STRIPE"
                        ? `Stripe bestätigt: ${row.stripeConfirmed ? "Ja" : "Nein"}`
                        : "Rechnung / manuell"
                    }
                  >
                    {row.paymentMode === "STRIPE"
                      ? row.stripeConfirmed
                        ? "Stripe ✓"
                        : "Stripe –"
                      : "Rechnung"}
                  </span>
                  {isPendingRow ? (
                    <span className="text-[11px] text-[var(--color-ember)]">Speichert…</span>
                  ) : null}
                </div>
                <div
                  className="relative flex items-center justify-end"
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
                    <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-[var(--color-border)] bg-white p-2 text-xs shadow-xl">
                      <button
                        type="button"
                        onClick={() => handleResendConfirmation(row.id)}
                        className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)]"
                      >
                        {confirmPendingId === row.id ? "Sendet..." : "Bestätigung mailen"}
                      </button>
                      {isInvoice ? (
                        <button
                          type="button"
                          onClick={() => handleResendInvoice(row.id)}
                          className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)]"
                        >
                          {invoicePendingId === row.id ? "Sendet..." : "Rechnung mailen"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDeleteBooking(row.id)}
                        className="w-full rounded-lg px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                      >
                        {deletePendingId === row.id ? "Löscht..." : "Eintrag löschen"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          {!filteredRows.length ? (
            <div className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
              Keine Buchungen gefunden.
            </div>
          ) : null}
        </div>
      </div>
      {activeRow && draft ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Buchung Details
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
                  {activeRow.customerName}
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {activeRow.customerEmail} · {formatPrice(activeRow.amountCHF)}
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
              <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Status
                  </p>
                  <div className="mt-3 space-y-3">
                    {[
                      {
                        label: "Offen",
                        values: ["PENDING", "PAYMENT_PENDING", "INVOICE_REQUESTED"] as BookingStatus[],
                      },
                      {
                        label: "Abgeschlossen",
                        values: ["PAID", "CANCELLED"] as BookingStatus[],
                      },
                    ].map((group) => (
                      <div key={group.label}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                          {group.label}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {group.values.map((value) => {
                            const option = statusOptions.find((item) => item.value === value);
                            if (!option) return null;
                            const isActive = activeRow.status === option.value;
                            const chipClass =
                              option.value === "PAID"
                                ? "bg-emerald-100 text-emerald-800"
                                : option.value === "INVOICE_REQUESTED"
                                  ? "bg-amber-100 text-amber-800"
                                  : option.value === "PAYMENT_PENDING"
                                    ? "bg-blue-100 text-blue-800"
                                    : option.value === "CANCELLED"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-gray-100 text-gray-700";
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleStatusChange(activeRow.id, option.value)}
                                disabled={isPending}
                                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                                  isActive
                                    ? chipClass
                                    : "border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-forest)]"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
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
                        <button
                          type="button"
                          onClick={() => handleResendConfirmation(activeRow.id)}
                          className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)]"
                        >
                          {confirmPendingId === activeRow.id ? "Sendet..." : "Bestätigung mailen"}
                        </button>
                        {activeRow.paymentMode === "INVOICE" ? (
                          <button
                            type="button"
                            onClick={() => handleResendInvoice(activeRow.id)}
                            className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-[var(--color-stone)]"
                          >
                            {invoicePendingId === activeRow.id ? "Sendet..." : "Rechnung mailen"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(activeRow.id)}
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
                    value={draft.customerName}
                    onChange={(event) => updateDraftField("customerName", event.target.value)}
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    E-Mail
                  </label>
                  <input
                    value={draft.customerEmail}
                    onChange={(event) => updateDraftField("customerEmail", event.target.value)}
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Telefon
                  </label>
                  <input
                    value={draft.customerPhone || ""}
                    onChange={(event) => updateDraftField("customerPhone", event.target.value)}
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Land
                  </label>
                  <input
                    value={draft.customerCountry || ""}
                    onChange={(event) => updateDraftField("customerCountry", event.target.value)}
                    className="form-input w-full px-3 py-2"
                  />
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Adresse
                  </label>
                  <input
                    value={draft.customerAddressLine1 || ""}
                    onChange={(event) =>
                      updateDraftField("customerAddressLine1", event.target.value)
                    }
                    placeholder="Strasse und Nr."
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <input
                    value={draft.customerAddressLine2 || ""}
                    onChange={(event) =>
                      updateDraftField("customerAddressLine2", event.target.value)
                    }
                    placeholder="Zusatz / Firma"
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    PLZ
                  </label>
                  <input
                    value={draft.customerPostalCode || ""}
                    onChange={(event) =>
                      updateDraftField("customerPostalCode", event.target.value)
                    }
                    className="form-input w-full px-3 py-2"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Ort
                  </label>
                  <input
                    value={draft.customerCity || ""}
                    onChange={(event) => updateDraftField("customerCity", event.target.value)}
                    className="form-input w-full px-3 py-2"
                  />
                </div>
              </section>

              <section className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Notizen
                </label>
                <textarea
                  value={draft.notes || ""}
                  onChange={(event) => updateDraftField("notes", event.target.value)}
                  rows={4}
                  className="form-input w-full px-3 py-2"
                />
              </section>

              <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Buchungsdetails
                </p>
                <div className="mt-3 grid gap-2 text-[var(--color-muted)]">
                  <div>
                    <span className="font-semibold text-[var(--color-text)]">Leistung:</span>{" "}
                    {bookingTypeLabels[activeRow.type] ?? activeRow.type}
                    {activeRow.title ? ` · ${activeRow.title}` : ""}
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--color-text)]">Datum:</span>{" "}
                    {formatDate(activeRow.createdAt)}
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--color-text)]">Zahlung:</span>{" "}
                    {activeRow.paymentMode === "STRIPE"
                      ? activeRow.stripeConfirmed
                        ? "Stripe (bestätigt)"
                        : "Stripe (nicht bestätigt)"
                      : "Rechnung / manuell"}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
