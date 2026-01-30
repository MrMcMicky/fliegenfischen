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
    <div className="mx-auto w-full max-w-6xl space-y-12 px-6 pb-24 pt-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SectionHeader
            eyebrow={`${course.level} · ${course.category}`}
            title={course.title}
            description={course.description}
          />
          <div className="flex flex-wrap gap-3 text-sm text-[var(--color-forest)]/70">
            <span>Dauer {course.duration}</span>
            <span>·</span>
            <span>{course.location}</span>
            <span>·</span>
            <span>Max. {course.maxParticipants} Personen</span>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
              Inhalte
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--color-forest)]/70 sm:grid-cols-2">
              {course.highlights.map((highlight) => (
                <li key={highlight}>• {highlight}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
              Ausruestung
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-forest)]/70">
              {course.equipment.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl bg-[var(--color-forest)] p-8 text-white shadow-[0_30px_80px_rgba(12,43,42,0.4)]">
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
          <div className="rounded-3xl border border-white/60 bg-white/90 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
              Termine
            </p>
            {sessions.length ? (
              <div className="mt-4 space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[var(--color-forest)]">
                        {formatDate(session.date)}
                      </p>
                      <p className="text-xs text-[var(--color-forest)]/60">
                        {session.startTime} - {session.endTime}
                      </p>
                    </div>
                    <Link
                      href="/kontakt"
                      className="rounded-full bg-[var(--color-forest)] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Platz sichern
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--color-forest)]/70">
                Termine auf Anfrage. Melde dich fuer den naechsten Kurs.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
