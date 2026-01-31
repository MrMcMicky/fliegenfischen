import Link from "next/link";

import { SectionHeader } from "@/components/SectionHeader";
import { reports } from "@/lib/reports";

export const metadata = {
  title: "Wissen & Berichte",
  description: "Reiseberichte, Gewässer und Praxistipps aus der Region.",
};

export default function BerichtePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Wissen"
        title="Berichte & Einblicke"
        description="Bestehende Inhalte werden hier modern aufbereitet: Reiseberichte, Technik und Gewässer-Wissen."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link
            key={report.slug}
            href={`/berichte/${report.slug}`}
            className="rounded-xl border border-[var(--color-border)] bg-white p-6 transition hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              {report.location} · {report.year}
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
              {report.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {report.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
