import type { Metadata } from "next";
import Link from "next/link";

import { StructuredData } from "@/components/seo/StructuredData";
import { SectionHeader } from "@/components/SectionHeader";
import {
  buildBreadcrumbStructuredData,
  buildPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Wetter",
  description: "Wetterinformationen für Kurse in der Schweiz.",
  path: "/wetter",
});

export default function WetterPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 pb-20 pt-16">
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: "Startseite", path: "/" },
          { name: "Wetter", path: "/wetter" },
        ])}
      />
      <SectionHeader
        eyebrow="Service"
        title="Wetter in der Schweiz"
        description="Für eine sichere Kursplanung empfehlen wir den Blick auf aktuelle Wetterdaten."
      />
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
        <p>
          Wir planen Kurse auch bei wechselhaftem Wetter. Bitte prüfe die
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
