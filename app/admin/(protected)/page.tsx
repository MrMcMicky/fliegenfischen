import Link from "next/link";

import { prisma } from "@/lib/db";
import { bookingStatusLabels } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [upcomingSessions, bookings, vouchers] = await Promise.all([
    prisma.courseSession.findMany({
      where: { date: { gte: new Date() } },
      include: { course: true },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.voucher.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Naechste Termine
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
