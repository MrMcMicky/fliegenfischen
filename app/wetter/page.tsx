import Link from "next/link";

import { SectionHeader } from "@/components/SectionHeader";

export const metadata = {
  title: "Wetter",
  description: "Wetterinformationen fuer Kurse in der Schweiz.",
};

export default function WetterPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 pb-24 pt-16">
      <SectionHeader
        eyebrow="Service"
        title="Wetter in der Schweiz"
        description="Fuer eine sichere Kursplanung empfehlen wir den Blick auf aktuelle Wetterdaten."
      />
      <div className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-[var(--color-forest)]/70">
        <p>
          Wir planen Kurse auch bei wechselhaftem Wetter. Bitte pruefe die
          lokalen Bedingungen vor dem Termin.
        </p>
        <p className="mt-4">
          Empfehlung:{" "}
          <Link
            href="https://www.meteoschweiz.admin.ch/"
            className="font-semibold text-[var(--color-forest)] underline"
            target="_blank"
            rel="noreferrer"
          >
            MeteoSchweiz
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
