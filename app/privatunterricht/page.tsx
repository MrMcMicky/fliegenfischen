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
  const [lesson, settings] = await Promise.all([
    prisma.lessonOffering.findUnique({
      where: { type: "PRIVATE" },
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);
  const contact =
    (settings?.contact as {
      instructor: string;
      address: string[];
      phone: string;
      mobile: string;
      email: string;
    }) || {
      instructor: "",
      address: ["", ""],
      phone: "",
      mobile: "",
      email: "",
    };

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
        description="Wir richten uns ganz nach dir: Ob Wurftechnik verfeinern, Gewässer lesen lernen oder die erste Forelle fangen."
      />
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
              <Image
                src="/illustrations/private-lessons.png"
                alt="Illustration Privatunterricht"
                width={720}
                height={480}
                className="h-48 w-full object-contain"
              />
            </div>
            <p className="mt-6 text-sm text-[var(--color-muted)]">
              Wir richten uns nach deinem Niveau: Ob Korrektur von Technikfehlern,
              neue Wurfvarianten oder direkte Praxis am Wasser.
            </p>
          </div>
          <ul className="space-y-4">
            {lesson.bullets.map((bullet, index) => {
              const iconSrc = [
                "/illustrations/icon-calendar.png",
                "/illustrations/icon-target.png",
                "/illustrations/icon-rod.png",
              ][index] ?? "/illustrations/icon-rod.png";

              return (
                <li key={bullet} className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-white">
                    <Image
                      src={iconSrc}
                      alt=""
                      width={64}
                      height={64}
                      className="h-7 w-7 object-contain"
                    />
                  </span>
                  <div className="pt-1 text-sm">
                    <p className="font-semibold text-[var(--color-text)]">
                      {bullet}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="h-fit rounded-2xl bg-[var(--color-forest)] p-8 text-white shadow-lg lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Preis
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {formatPrice(lesson.priceCHF)} / Std.
          </p>
          <p className="mt-3 text-sm text-white/70">
            Mindestens {lesson.minHours} Stunden. Jede weitere Person +
            {formatPrice(lesson.additionalPersonCHF)} / Std.
          </p>
          <div className="mt-6">
            <Button href="/buchen?lesson=private" className="w-full">
              Privatlektion buchen
            </Button>
          </div>
          <div className="mt-6 text-sm text-white/80">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Fragen?
            </p>
            {contact.phone ? <p className="mt-2">Tel. {contact.phone}</p> : null}
            {contact.mobile ? <p>Natel {contact.mobile}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
