import Image from "next/image";

import { Button } from "@/components/Button";
import { formatDate, formatPrice } from "@/lib/format";
import {
  courseCategoryLabels,
  courseLevelLabels,
} from "@/lib/public-types";

export function CourseCard({
  course,
  sessions = [],
}: {
  course: {
    id: string;
    slug: string;
    title: string;
    level: string;
    category: string;
    summary: string;
    imageSrc?: string | null;
    imageAlt?: string | null;
    duration: string;
    maxParticipants: number;
    location: string;
    priceCHF: number;
  };
  sessions?: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
  }[];
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
      {course.imageSrc ? (
        <div className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
          <Image
            src={course.imageSrc}
            alt={course.imageAlt || course.title}
            width={520}
            height={240}
            className="h-24 w-full object-contain"
          />
        </div>
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
          {courseLevelLabels[course.level] ?? course.level} · {" "}
          {courseCategoryLabels[course.category] ?? course.category}
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
            Naechste Termine
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
