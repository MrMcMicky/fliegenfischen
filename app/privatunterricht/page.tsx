import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { privateLessons } from "@/lib/courses";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Privatunterricht",
  description: "Individuelle Privatstunden fuer Technik und Praxis.",
};

export default function PrivatunterrichtPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 pb-24 pt-16">
      <SectionHeader
        eyebrow="Privatunterricht"
        title="Individuelles Coaching am Wasser"
        description={privateLessons.description}
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/90 p-6">
          <p className="text-sm text-[var(--color-forest)]/70">
            Wir richten uns nach deinem Niveau: Technikfehler, Wurfvarianten,
            Praxis am Wasser. Ideal fuer alle, die gezielt Fortschritt wollen.
          </p>
          <ul className="space-y-2 text-sm text-[var(--color-forest)]/70">
            <li>• Termine unter der Woche nach Vereinbarung</li>
            <li>• Fokus auf individuelle Ziele</li>
            <li>• Ausruestung kann gestellt werden</li>
          </ul>
        </div>
        <div className="rounded-3xl bg-[var(--color-forest)] p-8 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Preis
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {formatPrice(privateLessons.priceCHF)} / Std.
          </p>
          <p className="mt-2 text-sm text-white/70">
            Mindestens {privateLessons.minHours} Stunden. Jede weitere Person +
            {formatPrice(privateLessons.additionalPersonCHF)} / Std.
          </p>
          <div className="mt-6">
            <Button href="/kontakt" variant="secondary">
              Termin anfragen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
