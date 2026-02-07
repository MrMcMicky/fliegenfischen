"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { BookingStatus, BookingType, PaymentMode } from "@prisma/client";

import { bookingStatusLabels, bookingTypeLabels } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { resendInvoiceEmail, updateBookingStatus } from "./actions";

type BookingRow = {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
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
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest(`[data-status-menu="${openMenuId}"]`)) {
        return;
      }
      setOpenMenuId(null);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);

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
    });
  };

  const handleResendInvoice = (id: string) => {
    setInvoicePendingId(id);
    startTransition(async () => {
      await resendInvoiceEmail(id);
      setInvoicePendingId((current) => (current === id ? null : current));
    });
  };

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
                className="grid items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--color-stone)]/60 lg:grid-cols-[110px_minmax(240px,1.5fr)_minmax(220px,1.2fr)_90px_minmax(200px,1fr)_minmax(180px,1fr)]"
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
                  <div className="relative" data-status-menu={row.id}>
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
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(row.id, "PAID")}
                    disabled={row.status === "PAID" || isPending}
                    className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text)] transition hover:shadow disabled:opacity-60"
                  >
                    Bezahlt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(row.id, "CANCELLED")}
                    disabled={row.status === "CANCELLED" || isPending}
                    className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text)] transition hover:shadow disabled:opacity-60"
                  >
                    Stornieren
                  </button>
                  {isInvoice ? (
                    <button
                      type="button"
                      onClick={() => handleResendInvoice(row.id)}
                      disabled={invoicePendingId === row.id || isPending}
                      className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text)] transition hover:shadow disabled:opacity-60"
                    >
                      {invoicePendingId === row.id ? "Sendet..." : "Rechnung mailen"}
                    </button>
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
    </div>
  );
}
