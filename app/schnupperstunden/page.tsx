import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Schnupperstunden",
  description: "Schnupperstunden fuer den ersten Einstieg ins Fliegenfischen.",
};

export const dynamic = "force-dynamic";

export default async function SchnupperstundenPage() {
  const lesson = await prisma.lessonOffering.findUnique({
    where: { type: "TASTER" },
  });

  if (!lesson) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-16">
        <p className="text-sm text-[var(--color-muted)]">
          Inhalte werden vorbereitet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Schnupperstunden"
        title="Der perfekte Einstieg"
        description={lesson.description}
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6">
          <p className="text-sm text-[var(--color-muted)]">
            In zwei Stunden lernst du die Grundtechnik, das Material und die
            wichtigsten Sicherheitsregeln. Ideal fuer Einsteiger und Geschenke.
          </p>
          <ul className="space-y-2 text-sm text-[var(--color-muted)]">
            {lesson.bullets.map((bullet) => (
              <li key={bullet}>• {bullet}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-[var(--color-forest)] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Preis
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {formatPrice(lesson.priceCHF)} / Std.
          </p>
          <p className="mt-2 text-sm text-white/70">
            Mindestens {lesson.minHours} Stunden. Jede weitere Person +
            {formatPrice(lesson.additionalPersonCHF)} / Std.
          </p>
          <div className="mt-6">
            <Button href="/buchen?lesson=TASTER" variant="secondary">
              Schnuppertermin sichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
