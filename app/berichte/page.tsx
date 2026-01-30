import Link from "next/link";

import { SectionHeader } from "@/components/SectionHeader";
import { reports } from "@/lib/reports";

export const metadata = {
  title: "Wissen & Berichte",
  description: "Reiseberichte, Gewaesser und Praxistipps aus der Region.",
};

export default function BerichtePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-6 pb-24 pt-16">
      <SectionHeader
        eyebrow="Wissen"
        title="Berichte & Einblicke"
        description="Bestehende Inhalte werden hier modern aufbereitet: Reiseberichte, Technik und Gewaesser-Wissen."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link
            key={report.slug}
            href={`/berichte/${report.slug}`}
            className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(12,43,42,0.08)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
              {report.location} · {report.year}
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-forest)]">
              {report.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-forest)]/70">
              {report.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
