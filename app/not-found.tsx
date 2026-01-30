import Link from "next/link";

import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-6 pb-24 pt-24">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
        404
      </p>
      <h1 className="font-display text-4xl font-semibold text-[var(--color-forest)]">
        Diese Seite wurde nicht gefunden.
      </h1>
      <p className="text-sm text-[var(--color-forest)]/70">
        Vielleicht hat sich die URL geaendert. Nutze die Navigation oder gehe
        zur Startseite.
      </p>
      <div className="flex gap-4">
        <Button href="/">Zur Startseite</Button>
        <Link
          href="/kurse"
          className="rounded-full border border-[var(--color-forest)]/20 px-5 py-2 text-sm font-semibold text-[var(--color-forest)]"
        >
          Zu den Kursen
        </Link>
      </div>
    </div>
  );
}
