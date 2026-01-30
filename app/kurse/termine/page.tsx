import Link from "next/link";

import { SectionHeader } from "@/components/SectionHeader";
import { courseSessions, courses } from "@/lib/courses";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Termine",
  description: "Alle Kursdaten und Preise auf einen Blick.",
};

export default function TerminePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 pb-24 pt-16">
      <SectionHeader
        eyebrow="Termine"
        title="Kursdaten & Preise"
        description="Alle verfuegbaren Termine. Fuer Privatstunden oder Schnuppern bitte direkt anfragen."
      />
      <div className="space-y-4">
        {courseSessions.map((session) => {
          const course = courses.find((item) => item.slug === session.courseSlug);
          if (!course) return null;

          return (
            <div
              key={session.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(12,43,42,0.08)] md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
                  {course.title}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--color-forest)]">
                  {formatDate(session.date)}
                </h3>
                <p className="text-sm text-[var(--color-forest)]/70">
                  {session.startTime} - {session.endTime} · {session.location}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <p className="text-lg font-semibold text-[var(--color-forest)]">
                  {formatPrice(session.priceCHF)}
                </p>
                <Link
                  href={`/kurse/${course.slug}`}
                  className="rounded-full bg-[var(--color-forest)] px-5 py-2 text-xs font-semibold text-white"
                >
                  Kursdetails
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
