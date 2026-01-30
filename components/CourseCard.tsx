import Link from "next/link";

import type { Course, CourseSession } from "@/lib/courses";
import { formatDate, formatPrice } from "@/lib/utils";

export function CourseCard({
  course,
  sessions = [],
}: {
  course: Course;
  sessions?: CourseSession[];
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(12,43,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
            {course.level} · {course.category}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--color-forest)]">
            {course.title}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-forest)]/70">
            {course.summary}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--color-mist)] px-4 py-2 text-sm font-semibold text-[var(--color-forest)]">
          {formatPrice(course.priceCHF)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--color-forest)]/60">
        <span>Dauer: {course.duration}</span>
        <span>·</span>
        <span>Max. {course.maxParticipants} Personen</span>
        <span>·</span>
        <span>{course.location}</span>
      </div>
      {sessions.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
            Naechste Termine
          </p>
          {sessions.slice(0, 2).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-2 text-sm"
            >
              <span>{formatDate(session.date)}</span>
              <span className="text-[var(--color-forest)]/60">
                {session.startTime}-{session.endTime}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/kurse/${course.slug}`}
          className="rounded-full bg-[var(--color-forest)] px-5 py-2 text-sm font-semibold text-white"
        >
          Kursdetails
        </Link>
        <Link
          href="/kontakt"
          className="rounded-full border border-[var(--color-forest)]/20 px-5 py-2 text-sm font-semibold text-[var(--color-forest)]"
        >
          Anfrage
        </Link>
      </div>
    </div>
  );
}
