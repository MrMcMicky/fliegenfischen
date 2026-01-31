import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { courses, getCourseBySlug, getSessionsForCourse } from "@/lib/courses";
import { formatDate, formatPrice } from "@/lib/utils";

export const generateStaticParams = async () =>
  courses.map((course) => ({ slug: course.slug }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const course = getCourseBySlug(params.slug);
  if (!course) {
    return { title: "Kurs" };
  }
  return {
    title: course.title,
    description: course.summary,
  };
};

export default function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  const sessions = getSessionsForCourse(course.slug);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionHeader
            eyebrow={`${course.level} · ${course.category}`}
            title={course.title}
            description={course.description}
          />
          {course.image ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
              <Image
                src={course.image.src}
                alt={course.image.alt}
                width={640}
                height={280}
                className="h-28 w-full object-contain"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
            <span>Dauer {course.duration}</span>
            <span>·</span>
            <span>{course.location}</span>
            <span>·</span>
            <span>Max. {course.maxParticipants} Personen</span>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              Inhalte
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--color-muted)] sm:grid-cols-2">
              {course.highlights.map((highlight) => (
                <li key={highlight}>• {highlight}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              Ausruestung
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
              {course.equipment.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Inklusive
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
                {course.includes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Voraussetzungen
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted)]">
                {course.prerequisites.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl bg-[var(--color-forest)] p-8 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">
              Preis
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {formatPrice(course.priceCHF)}
            </p>
            <p className="mt-2 text-sm text-white/70">
              Kurs inkl. Betreuung in Kleingruppe.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button href="/kontakt" variant="secondary">
                Kurs anfragen
              </Button>
              <Button href="/kurse/termine" variant="ghost">
                Alle Termine
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              Termine
            </p>
            {sessions.length ? (
              <div className="mt-4 space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[var(--color-text)]">
                        {formatDate(session.date)}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {session.startTime} - {session.endTime}
                      </p>
                    </div>
                    <Button href="/kontakt" size="sm">
                      Platz sichern
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--color-muted)]">
                Termine auf Anfrage. Melde dich fuer den naechsten Kurs.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
