import Image from "next/image";
import { Fish } from "lucide-react";

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
  const hasImage = Boolean(course.imageSrc);
  const isSvg = course.imageSrc?.endsWith(".svg") ?? false;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
      {hasImage ? (
        <div className="-mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl border-b border-[var(--color-border)] bg-[var(--color-stone)]">
          <Image
            src={course.imageSrc as string}
            alt={course.imageAlt || course.title}
            width={640}
            height={360}
            className={`h-48 w-full ${isSvg ? "object-contain" : "object-cover"}`}
          />
        </div>
      ) : (
        <div className="-mx-6 -mt-6 mb-4 flex h-48 items-center justify-center rounded-t-xl border-b border-[var(--color-border)] bg-[#E8F0F0] text-[var(--color-forest)]/70">
          <Fish size={28} aria-hidden="true" />
        </div>
      )}
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
