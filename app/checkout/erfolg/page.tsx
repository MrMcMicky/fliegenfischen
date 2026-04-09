import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutSuccessClient } from "@/components/CheckoutSuccessClient";
import { prisma } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Zahlung erfolgreich",
    description: "Vielen Dank für deine Buchung.",
    path: "/checkout/erfolg",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
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
      {bookingId ? (
        <CheckoutSuccessClient
          bookingId={bookingId}
          initialVoucherCode={booking?.voucher?.code ?? null}
          initialVoucherDeliveryMethod={booking?.voucherDeliveryMethod ?? null}
        />
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
