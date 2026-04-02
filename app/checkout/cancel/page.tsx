import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Zahlung abgebrochen",
    description: "Zahlung wurde abgebrochen.",
    path: "/checkout/cancel",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-20 pt-16">
      <h1 className="font-display text-3xl font-semibold">
        Zahlung abgebrochen
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        Die Zahlung wurde nicht abgeschlossen. Du kannst es jederzeit erneut
        versuchen.
      </p>
      <Link
        href="/kurse"
        className="inline-flex items-center justify-center rounded-full border border-[var(--color-forest)]/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]"
      >
        Zurück zu den Kursen
      </Link>
    </div>
  );
}
