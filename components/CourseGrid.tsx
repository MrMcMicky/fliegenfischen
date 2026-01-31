import Image from "next/image";
import Link from "next/link";

import { formatDate, formatPrice } from "@/lib/format";

export function CourseGrid({
  sessions,
}: {
  sessions: {
    id: string;
    course: {
      slug: string;
      title: string;
      imageSrc?: string | null;
      imageAlt?: string | null;
    } | null;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    priceCHF: number;
    availableSpots: number;
  }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="rounded-xl border border-[var(--color-border)] bg-white p-6 transition hover:shadow-lg"
        >
          {session.course?.imageSrc ? (
            <div className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
              <Image
                src={session.course.imageSrc}
                alt={session.course.imageAlt || session.course.title}
                width={520}
                height={240}
                className="h-20 w-full object-contain"
              />
            </div>
          ) : null}
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
          {session.course ? (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {session.course.title}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-[var(--color-forest)]/60">
            Noch {session.availableSpots} Plätze
          </p>
          <div className="mt-6">
            <Link
              href={session.course ? `/kurse/${session.course.slug}` : "/kurse"}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-forest)]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)] transition hover:border-[var(--color-forest)]"
            >
              Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
