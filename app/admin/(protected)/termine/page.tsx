import Link from "next/link";

import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminTerminePage() {
  const sessions = await prisma.courseSession.findMany({
    include: { course: true },
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Termine</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Kursdaten verwalten.
          </p>
        </div>
        <Link
          href="/admin/termine/neu"
          className="rounded-full bg-[var(--color-forest)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Neuer Termin
        </Link>
      </div>
      <div className="space-y-3">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/admin/termine/${session.id}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm"
          >
            <div>
              <p className="font-semibold text-[var(--color-text)]">
                {session.course?.title}
              </p>
              <p className="text-[var(--color-muted)]">
                {formatDate(session.date)} · {session.startTime}-{session.endTime}
              </p>
            </div>
            <span className="text-[var(--color-forest)]">Bearbeiten</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
