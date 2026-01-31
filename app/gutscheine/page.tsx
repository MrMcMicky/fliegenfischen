import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { VoucherOptionCard } from "@/components/VoucherOptionCard";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Gutscheine",
  description: "Wert- und Kursgutscheine für Fliegenfischerkurse.",
};

export const dynamic = "force-dynamic";

export default async function GutscheinePage() {
  const voucherOptions = await prisma.voucherOption.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Gutscheine"
        title="Geschenk mit Erlebnis"
        description="Ob Wertgutschein oder konkreter Kurs: Gutscheine sind unbefristet gültig und perfekt für Einsteiger wie Fortgeschrittene."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {voucherOptions.map((option) => (
          <VoucherOptionCard key={option.id} option={option} />
        ))}
      </div>
      <div className="rounded-2xl bg-[var(--color-forest)] p-10 text-white">
        <h3 className="font-display text-2xl font-semibold">
          Wunschtext & Versand
        </h3>
        <p className="mt-3 text-sm text-white/70">
          Wir erstellen den Gutschein als PDF mit persönlicher Widmung. Versand
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
