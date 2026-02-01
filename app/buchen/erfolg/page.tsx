import Link from "next/link";

import { prisma } from "@/lib/db";

export const metadata = {
  title: "Anfrage erhalten",
  description: "Wir melden uns mit der Rechnung.",
};

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { bookingId?: string };
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const params =
    resolvedParams && typeof (resolvedParams as { get?: unknown }).get === "function"
      ? Object.fromEntries(
          (resolvedParams as URLSearchParams).entries()
        )
      : (resolvedParams ?? {});

  const bookingId = (params as { bookingId?: string }).bookingId;
  const booking = bookingId
    ? await prisma.booking.findUnique({ where: { id: bookingId } })
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-20 pt-16">
      <h1 className="font-display text-3xl font-semibold">
        Danke für deine Anfrage!
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        Wir senden dir in Kürze die Rechnung und alle Details per E-Mail.
      </p>
      {booking ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
          <p className="font-semibold text-[var(--color-text)]">
            Buchung #{booking.id}
          </p>
          <p>Status: {booking.status}</p>
        </div>
      ) : null}
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full border border-[var(--color-forest)]/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
