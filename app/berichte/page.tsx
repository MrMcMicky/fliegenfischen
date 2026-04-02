import type { Metadata } from "next";
import Link from "next/link";

import { StructuredData } from "@/components/seo/StructuredData";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";
import {
  buildBreadcrumbStructuredData,
  buildPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Wissen & Berichte",
  description: "Reiseberichte, Gewässer und Praxistipps aus der Region.",
  path: "/berichte",
});

export const dynamic = "force-dynamic";

const extractFirstImage = (body: string) => {
  const match = body.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] || null;
};

export default async function BerichtePage() {
  const reports = await prisma.report.findMany({ orderBy: { year: "desc" } });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: "Startseite", path: "/" },
          { name: "Berichte", path: "/berichte" },
        ])}
      />
      <SectionHeader
        eyebrow="Wissen"
        title="Berichte & Einblicke"
        description="Bestehende Inhalte werden hier modern aufbereitet: Reiseberichte, Technik und Gewässer-Wissen."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const heroImage =
            report.coverImage || extractFirstImage(report.body || "");
          return (
            <Link
              key={report.slug}
              href={`/berichte/${report.slug}`}
              className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-6 transition hover:shadow-lg"
            >
              {heroImage ? (
                <div
                  className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
                  style={{ backgroundImage: `url(${heroImage})` }}
                />
              ) : null}
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                  {report.location} · {report.year}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
                  {report.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {report.summary}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
