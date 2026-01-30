import Link from "next/link";

import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-4 pb-20 pt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
        404
      </p>
      <h1 className="font-display text-4xl font-semibold text-[var(--color-text)]">
        Diese Seite wurde nicht gefunden.
      </h1>
      <p className="text-sm text-[var(--color-muted)]">
        Vielleicht hat sich die URL geaendert. Nutze die Navigation oder gehe
        zur Startseite.
      </p>
      <div className="flex gap-4">
        <Button href="/">Zur Startseite</Button>
        <Button href="/kurse" variant="secondary">
          Zu den Kursen
        </Button>
      </div>
    </div>
  );
}
