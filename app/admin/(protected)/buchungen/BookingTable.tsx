"use client";

import { useMemo, useState, useTransition } from "react";
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

type SortKey = "newest" | "oldest" | "status" | "amount" | "name";
type SortField = "date" | "customer" | "type" | "amount" | "status";
type SortDirection = "asc" | "desc";

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
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [invoicePendingId, setInvoicePendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = term
      ? rows.filter(
          (row) =>
            row.customerName.toLowerCase().includes(term) ||
            row.customerEmail.toLowerCase().includes(term) ||
            (row.title || "").toLowerCase().includes(term)
        )
      : rows;

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

  const applySortPreset = (value: SortKey) => {
    setSortKey(value);
    if (value === "newest") {
      setSortField("date");
      setSortDirection("desc");
    } else if (value === "oldest") {
      setSortField("date");
      setSortDirection("asc");
    } else if (value === "amount") {
      setSortField("amount");
      setSortDirection("desc");
    } else if (value === "name") {
      setSortField("customer");
      setSortDirection("asc");
    } else {
      setSortField("status");
      setSortDirection("asc");
    }
  };

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Suche nach Name, E-Mail oder Kurs"
            className="form-input w-64 px-3 py-2 text-sm"
          />
          <select
            value={sortKey}
            onChange={(event) => applySortPreset(event.target.value as SortKey)}
            className="form-input px-3 py-2 text-sm"
          >
            <option value="newest">Neueste zuerst</option>
            <option value="oldest">Älteste zuerst</option>
            <option value="status">Status</option>
            <option value="amount">Betrag</option>
            <option value="name">Kunde</option>
          </select>
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          Status wird automatisch gespeichert.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-stone)] text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("date")}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Datum <span className="text-[10px]">{getSortIndicator("date")}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("customer")}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Kunde <span className="text-[10px]">{getSortIndicator("customer")}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("type")}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Typ <span className="text-[10px]">{getSortIndicator("type")}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("amount")}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Betrag <span className="text-[10px]">{getSortIndicator("amount")}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => handleHeaderSort("status")}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Status <span className="text-[10px]">{getSortIndicator("status")}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
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
                <tr key={row.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-4 align-top text-[var(--color-muted)]">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[var(--color-text)]">
                      {row.customerName}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {row.customerEmail}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[var(--color-text)]">
                      {bookingTypeLabels[row.type] ?? row.type}
                    </p>
                    {row.title ? (
                      <p className="text-xs text-[var(--color-muted)]">{row.title}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 font-semibold text-[var(--color-text)]">
                    {formatPrice(row.amountCHF)}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={row.status}
                      onChange={(event) =>
                        handleStatusChange(row.id, event.target.value as BookingStatus)
                      }
                      className="form-input px-3 py-2 text-sm"
                      disabled={isPending}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass}`}>
                        {statusLabel}
                      </span>
                      <span className="text-[var(--color-muted)]">
                        {row.paymentMode === "STRIPE"
                          ? `Stripe bestätigt: ${row.stripeConfirmed ? "Ja" : "Nein"}`
                          : "Rechnung / manuell"}
                      </span>
                    </div>
                    {isPendingRow ? (
                      <p className="mt-1 text-[11px] text-[var(--color-ember)]">
                        Speichert...
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
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
                  </td>
                </tr>
              );
            })}
            {!filteredRows.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-[var(--color-muted)]"
                >
                  Keine Buchungen gefunden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
