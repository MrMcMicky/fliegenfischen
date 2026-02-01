import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = {
  title: "Termine",
  description: "Alle Kursdaten und Preise auf einen Blick.",
};

export const dynamic = "force-dynamic";

export default async function TerminePage() {
  const sessions = await prisma.courseSession.findMany({
    include: { course: true },
    orderBy: { date: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Termine"
        title="Kursdaten & Preise"
        description="Alle verfügbaren Termine. Für Privatstunden oder Schnuppern bitte direkt anfragen."
      />
      <div className="space-y-4">
        {sessions.map((session) => {
          const course = session.course;
          if (!course) return null;

          return (
            <div
              key={session.id}
              className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-white p-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                  {course.title}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--color-text)]">
                  {formatDate(session.date)}
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {session.startTime} - {session.endTime} · {session.location}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <p className="text-lg font-semibold text-[var(--color-forest)]">
                  {formatPrice(session.priceCHF)}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Noch {session.availableSpots} Plätze
                </p>
                <div className="flex flex-wrap gap-3">
                  {session.availableSpots > 0 ? (
                    <Button href={`/buchen?sessionId=${session.id}`} size="sm">
                      Platz sichern
                    </Button>
                  ) : null}
                  <Button
                    href={`/kurse/${course.slug}`}
                    variant="secondary"
                    size="sm"
                  >
                    Details
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
