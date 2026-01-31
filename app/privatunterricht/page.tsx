import Image from "next/image";

import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Privatunterricht",
  description: "Individuelle Privatstunden für Technik und Praxis.",
};

export const dynamic = "force-dynamic";

export default async function PrivatunterrichtPage() {
  const lesson = await prisma.lessonOffering.findUnique({
    where: { type: "PRIVATE" },
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
        eyebrow="Privatunterricht"
        title="Individuelles Coaching am Wasser"
        description={lesson.description}
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-xl border border-[var(--color-border)] bg-white p-6">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
            <Image
              src="/illustrations/private-lessons.png"
              alt="Illustration Privatunterricht"
              width={720}
              height={480}
              className="h-40 w-full object-contain sm:h-48"
            />
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            Wir richten uns nach deinem Niveau: Technikfehler, Wurfvarianten,
            Praxis am Wasser. Ideal für alle, die gezielt Fortschritt wollen.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {lesson.bullets.map((bullet, index) => {
              const iconSrc = [
                "/illustrations/icon-calendar.png",
                "/illustrations/icon-target.png",
                "/illustrations/icon-rod.png",
              ][index] ?? "/illustrations/icon-rod.png";

              return (
                <div
                  key={bullet}
                  className="flex flex-col items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] p-3 text-center text-sm text-[var(--color-muted)]"
                >
                  <Image
                    src={iconSrc}
                    alt=""
                    width={96}
                    height={96}
                    className="h-12 w-12 object-contain"
                  />
                  <p className="mt-3">{bullet}</p>
                </div>
              );
            })}
          </div>
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
            <Button href="/buchen?lesson=PRIVATE" variant="secondary">
              Termin anfragen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
