import Link from "next/link";

import { CheckoutSuccessClient } from "@/components/CheckoutSuccessClient";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Zahlung erfolgreich",
  description: "Vielen Dank für deine Buchung.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { bookingId?: string };
}) {
  const bookingId = searchParams.bookingId;
  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true, voucher: true },
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-20 pt-16">
      <h1 className="font-display text-3xl font-semibold">
        Danke! Zahlung erfolgreich.
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        Du erhältst in Kürze eine Bestätigung per E-Mail.
      </p>
      {bookingId ? <CheckoutSuccessClient bookingId={bookingId} /> : null}
      {booking?.voucher ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
          <p className="font-semibold text-[var(--color-text)]">Gutschein-Code</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-forest)]">
            {booking.voucher.code}
          </p>
          <Link
            href={`/api/voucher/pdf?bookingId=${booking.id}`}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--color-forest)]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]"
          >
            Gutschein PDF herunterladen
          </Link>
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
