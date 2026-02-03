import Link from "next/link";
import { Pencil } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { courseCategoryLabels, courseLevelLabels } from "@/lib/public-types";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { title: "asc" },
    include: {
      sessions: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Kurse</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Kurs-Typen und Inhalte verwalten.
          </p>
        </div>
        <Link
          href="/admin/kurse/neu"
          className="rounded-full bg-[var(--color-ember)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
        >
          Neuer Kurs
        </Link>
      </div>
      <div className="space-y-4">
        {courses.map((course) => {
          const nextSession = course.sessions[0];
          const hasUpcoming = Boolean(nextSession);
          const statusLabel = hasUpcoming ? "Aktiv" : "Ohne Termin";
          const statusClass = hasUpcoming
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-600";

          return (
            <Link
              key={course.id}
              href={`/admin/kurse/${course.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-5 text-sm transition hover:shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--color-text)]">
                    {course.title}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {courseCategoryLabels[course.category]} ·{" "}
                    {courseLevelLabels[course.level]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] transition group-hover:text-[var(--color-ember)]">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Bearbeiten
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                <span>{formatPrice(course.priceCHF)}</span>
                <span>·</span>
                <span>Dauer: {course.duration}</span>
                <span>·</span>
                <span>Max. {course.maxParticipants} Teilnehmende</span>
              </div>
              {nextSession ? (
                <p className="text-xs text-[var(--color-forest)]">
                  Nächster Termin: {formatDate(nextSession.date)} ·{" "}
                  {nextSession.startTime}-{nextSession.endTime}
                </p>
              ) : (
                <p className="text-xs text-[var(--color-muted)]">
                  Kein Termin geplant.
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
