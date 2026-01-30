import Link from "next/link";

import type { CourseSession } from "@/lib/courses";
import { getCourseBySlug } from "@/lib/courses";
import { formatDate, formatPrice } from "@/lib/utils";

type CourseGridProps = {
  sessions: CourseSession[];
};

export function CourseGrid({ sessions }: CourseGridProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {sessions.map((session) => {
        const course = getCourseBySlug(session.courseSlug);
        return (
          <div
            key={session.id}
            className="rounded-xl border border-[var(--color-border)] bg-white p-6 transition hover:shadow-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              {session.location}
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
              {formatDate(session.date)}
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              {session.startTime} - {session.endTime}
            </p>
            <p className="mt-4 text-lg font-semibold text-[var(--color-forest)]">
              {formatPrice(session.priceCHF)}
            </p>
            {course ? (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {course.title}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-[var(--color-forest)]/60">
              Noch {session.availableSpots} Plaetze
            </p>
            <div className="mt-6">
              <Link
                href={course ? `/kurse/${course.slug}` : "/kurse"}
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-forest)]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)] transition hover:border-[var(--color-forest)]"
              >
                Details
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
