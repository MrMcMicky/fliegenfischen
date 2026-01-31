import Image from "next/image";

import { Button } from "@/components/Button";
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
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
      {course.image ? (
        <div className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
          <Image
            src={course.image.src}
            alt={course.image.alt}
            width={520}
            height={240}
            className="h-24 w-full object-contain"
          />
        </div>
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
          {course.level} · {course.category}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--color-text)]">
          {course.title}
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {course.summary}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--color-forest)]/60">
        <span>Dauer {course.duration}</span>
        <span>·</span>
        <span>Max. {course.maxParticipants} Personen</span>
        <span>·</span>
        <span>{course.location}</span>
      </div>
      <div className="mt-4 text-lg font-semibold text-[var(--color-forest)]">
        {formatPrice(course.priceCHF)}
      </div>
      {sessions.length > 0 ? (
        <div className="mt-4 space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Nächste Termine
          </p>
          {sessions.slice(0, 2).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between text-sm text-[var(--color-text)]"
            >
              <span>{formatDate(session.date)}</span>
              <span className="text-[var(--color-muted)]">
                {session.startTime}-{session.endTime}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={`/kurse/${course.slug}`} variant="secondary" size="sm">
          Details
        </Button>
        <Button href="/kontakt" variant="ghost" size="sm">
          Anfrage
        </Button>
      </div>
    </div>
  );
}
