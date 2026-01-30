import { SectionHeader } from "@/components/SectionHeader";

export const metadata = {
  title: "Rechtliches",
  description: "Datenschutz, AGB und Impressum der Fliegenfischerschule.",
};

export default function RechtlichesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-6 pb-24 pt-16">
      <SectionHeader
        eyebrow="Rechtliches"
        title="Datenschutz, AGB & Impressum"
        description="Diese Inhalte werden mit dem Kunden final abgestimmt. Platzhalter fuer den Relaunch."
      />
      <div className="space-y-6 rounded-3xl border border-white/70 bg-white/90 p-8 text-sm text-[var(--color-forest)]/70">
        <div>
          <p className="font-semibold text-[var(--color-forest)]">Datenschutz</p>
          <p className="mt-2">
            Informationen zur Datenverarbeitung, Cookies und Zahlungsanbieter.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--color-forest)]">AGB & Storno</p>
          <p className="mt-2">
            Regeln zu Buchung, Zahlung, Umbuchung und Rueckerstattung.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--color-forest)]">Impressum</p>
          <p className="mt-2">
            Angaben zur Fliegenfischerschule, Kontakt und Haftungshinweise.
          </p>
        </div>
      </div>
    </div>
  );
}
