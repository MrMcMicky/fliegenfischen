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

    return [...list].sort((a, b) => {
      if (sortKey === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortKey === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortKey === "amount") {
        return b.amountCHF - a.amountCHF;
      }
      if (sortKey === "name") {
        return a.customerName.localeCompare(b.customerName);
      }
      const labelA = bookingStatusLabels[a.status] || a.status;
      const labelB = bookingStatusLabels[b.status] || b.status;
      return labelA.localeCompare(labelB);
    });
  }, [rows, query, sortKey]);

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
            onChange={(event) => setSortKey(event.target.value as SortKey)}
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
              <th className="px-4 py-3 text-left">Datum</th>
              <th className="px-4 py-3 text-left">Kunde</th>
              <th className="px-4 py-3 text-left">Typ</th>
              <th className="px-4 py-3 text-left">Betrag</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const isInvoice = row.paymentMode === "INVOICE";
              const isPendingRow = pendingId === row.id;
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
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {row.paymentMode === "STRIPE"
                        ? `Stripe bestätigt: ${row.stripeConfirmed ? "Ja" : "Nein"}`
                        : "Rechnung / manuell"}
                    </p>
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
