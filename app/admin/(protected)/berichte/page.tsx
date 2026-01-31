import Link from "next/link";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBerichtePage() {
  const reports = await prisma.report.findMany({ orderBy: { year: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Berichte</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Reiseberichte und Inhalte.
          </p>
        </div>
        <Link
          href="/admin/berichte/neu"
          className="rounded-full bg-[var(--color-forest)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Neuer Bericht
        </Link>
      </div>
      <div className="space-y-3">
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/admin/berichte/${report.id}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm"
          >
            <div>
              <p className="font-semibold text-[var(--color-text)]">{report.title}</p>
              <p className="text-[var(--color-muted)]">{report.slug}</p>
            </div>
            <span className="text-[var(--color-forest)]">Bearbeiten</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
