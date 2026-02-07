import Link from "next/link";
import type { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { bookingStatusLabels, paymentStatusLabels } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const openBookingStatuses: BookingStatus[] = [
    "PENDING",
    "PAYMENT_PENDING",
    "INVOICE_REQUESTED",
  ];
  const [
    upcomingSessions,
    bookings,
    payments,
    vouchers,
    openBookingCount,
    openContactCount,
    bookingStatusCounts,
  ] = await Promise.all([
    prisma.courseSession.findMany({
      where: { date: { gte: new Date() } },
      include: { course: true },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { booking: true },
      take: 5,
    }),
    prisma.voucher.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.booking.count({
      where: {
        status: {
          in: openBookingStatuses,
        },
      },
    }),
    prisma.contactRequest.count({ where: { status: "OPEN" } }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { status: { in: openBookingStatuses } },
      _count: { _all: true },
    }),
  ]);
  const bookingStatusMap = bookingStatusCounts.reduce<Record<string, number>>(
    (acc, entry) => {
      acc[entry.status] = entry._count._all;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-10">
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/buchungen"
          className={`rounded-2xl border px-6 py-5 text-sm transition hover:shadow ${
            openBookingCount
              ? "border-[var(--color-ember)] bg-[var(--color-ember)]/10"
              : "border-[var(--color-border)] bg-white"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Offene Buchungen
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-[var(--color-text)]">
              {openBookingCount}
            </span>
            <span className="text-sm text-[var(--color-muted)]">
              {openBookingCount === 1 ? "Buchung wartet" : "Buchungen warten"}
            </span>
          </div>
          {openBookingCount ? (
            <div className="mt-4 space-y-1 text-xs text-[var(--color-muted)]">
              {openBookingStatuses.map((status) => (
                <div key={status} className="flex items-center justify-between">
                  <span>{bookingStatusLabels[status] ?? status}</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {bookingStatusMap[status] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </Link>
        <Link
          href="/admin/anfragen"
          className={`rounded-2xl border px-6 py-5 text-sm transition hover:shadow ${
            openContactCount
              ? "border-[var(--color-ember)] bg-[var(--color-ember)]/10"
              : "border-[var(--color-border)] bg-white"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Neue Anfragen
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-[var(--color-text)]">
              {openContactCount}
            </span>
            <span className="text-sm text-[var(--color-muted)]">
              {openContactCount === 1 ? "Anfrage offen" : "Anfragen offen"}
            </span>
          </div>
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Nächste Termine
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex flex-col">
                <span className="font-semibold text-[var(--color-text)]">
                  {session.course?.title}
                </span>
                <span className="text-[var(--color-muted)]">
                  {session.date.toISOString().split("T")[0]} · {session.startTime}-{session.endTime}
                </span>
              </div>
            ))}
            {!upcomingSessions.length ? (
              <p className="text-[var(--color-muted)]">Keine Termine.</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Letzte Zahlungen
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {payments.map((payment) => (
              <div key={payment.id} className="flex flex-col">
                <span className="font-semibold text-[var(--color-text)]">
                  {payment.booking.customerName}
                </span>
                <span className="text-[var(--color-muted)]">
                  CHF {payment.booking.amountCHF} ·{" "}
                  {paymentStatusLabels[payment.status] ?? payment.status}
                </span>
              </div>
            ))}
            {!payments.length ? (
              <p className="text-[var(--color-muted)]">Keine Zahlungen.</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Letzte Buchungen
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex flex-col">
                <span className="font-semibold text-[var(--color-text)]">
                  {booking.customerName}
                </span>
                <span className="text-[var(--color-muted)]">
                  {bookingStatusLabels[booking.status] ?? booking.status}
                </span>
              </div>
            ))}
            {!bookings.length ? (
              <p className="text-[var(--color-muted)]">Keine Buchungen.</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Neue Gutscheine
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="flex flex-col">
                <span className="font-semibold text-[var(--color-text)]">
                  {voucher.code}
                </span>
                <span className="text-[var(--color-muted)]">
                  CHF {voucher.remainingAmount}
                </span>
              </div>
            ))}
            {!vouchers.length ? (
              <p className="text-[var(--color-muted)]">Keine Gutscheine.</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/kurse"
          className="rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm font-semibold text-[var(--color-text)] hover:shadow"
        >
          Kurse verwalten
        </Link>
        <Link
          href="/admin/termine"
          className="rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm font-semibold text-[var(--color-text)] hover:shadow"
        >
          Termine verwalten
        </Link>
        <Link
          href="/admin/gutscheine"
          className="rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm font-semibold text-[var(--color-text)] hover:shadow"
        >
          Gutscheine verwalten
        </Link>
      </section>
    </div>
  );
}
