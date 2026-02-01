import Image from "next/image";
import { Fish } from "lucide-react";

import { Button } from "@/components/Button";
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
          {session.course ? (
            session.course.imageSrc ? (
              <div className="-mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl border-b border-[var(--color-border)] bg-[var(--color-stone)]">
                <Image
                  src={session.course.imageSrc}
                  alt={session.course.imageAlt || session.course.title}
                  width={640}
                  height={360}
                  className={`h-48 w-full ${
                    session.course.imageSrc.endsWith(".svg")
                      ? "object-contain"
                      : "object-cover"
                  }`}
                />
              </div>
            ) : (
              <div className="-mx-6 -mt-6 mb-4 flex h-48 items-center justify-center rounded-t-xl border-b border-[var(--color-border)] bg-[#E8F0F0] text-[var(--color-forest)]/70">
                <Fish size={24} aria-hidden="true" />
              </div>
            )
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
            {session.availableSpots > 0
              ? `Noch ${session.availableSpots} Plätze`
              : "Aktuell ausgebucht"}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {session.availableSpots > 0 ? (
              <Button href={`/buchen?sessionId=${session.id}`} size="sm">
                Platz sichern
              </Button>
            ) : null}
            <Button
              href={session.course ? `/kurse/${session.course.slug}` : "/kurse"}
              variant="secondary"
              size="sm"
            >
              Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
