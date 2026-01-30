import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { voucherOptions } from "@/lib/courses";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Gutscheine",
  description: "Wert- und Kursgutscheine fuer Fliegenfischerkurse.",
};

export default function GutscheinePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Gutscheine"
        title="Geschenk mit Erlebnis"
        description="Ob Wertgutschein oder konkreter Kurs: Gutscheine sind unbefristet gueltig und perfekt fuer Einsteiger wie Fortgeschrittene."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {voucherOptions.map((option) => (
          <div
            key={option.title}
            className="rounded-xl border border-[var(--color-border)] bg-white p-6"
          >
            <h3 className="font-display text-2xl font-semibold text-[var(--color-text)]">
              {option.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {option.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {option.values.map((value) => (
                <span
                  key={value}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-stone)] px-4 py-2 text-xs font-semibold text-[var(--color-forest)]"
                >
                  {formatPrice(value)}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Button href="/kontakt" variant="secondary">
                Gutschein anfragen
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[var(--color-forest)] p-10 text-white">
        <h3 className="font-display text-2xl font-semibold">
          Wunschtext & Versand
        </h3>
        <p className="mt-3 text-sm text-white/70">
          Wir erstellen den Gutschein als PDF mit persoenlicher Widmung. Versand
          per Mail oder auf Wunsch gedruckt.
        </p>
        <div className="mt-6">
          <Button href="/kontakt" variant="secondary">
            Wunschtext senden
          </Button>
        </div>
      </div>
    </div>
  );
}
