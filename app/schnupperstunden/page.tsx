import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { tasterLessons } from "@/lib/courses";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Schnupperstunden",
  description: "Schnupperstunden fuer den ersten Einstieg ins Fliegenfischen.",
};

export default function SchnupperstundenPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 pb-24 pt-16">
      <SectionHeader
        eyebrow="Schnupperstunden"
        title="Der perfekte Einstieg"
        description={tasterLessons.description}
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6">
          <p className="text-sm text-[var(--color-forest)]/70">
            In zwei Stunden lernst du die Grundtechnik, das Material und die
            wichtigsten Sicherheitsregeln. Ideal fuer Einsteiger und Geschenke.
          </p>
          <ul className="space-y-2 text-sm text-[var(--color-forest)]/70">
            <li>• Termine unter der Woche nach Vereinbarung</li>
            <li>• Ausruestung kann gestellt werden</li>
            <li>• Kleingruppe oder privat</li>
          </ul>
        </div>
        <div className="rounded-3xl bg-[var(--color-forest)] p-8 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Preis
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {formatPrice(tasterLessons.priceCHF)} / Std.
          </p>
          <p className="mt-2 text-sm text-white/70">
            Mindestens {tasterLessons.minHours} Stunden. Jede weitere Person +
            {formatPrice(tasterLessons.additionalPersonCHF)} / Std.
          </p>
          <div className="mt-6">
            <Button href="/kontakt" variant="secondary">
              Schnuppertermin sichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
