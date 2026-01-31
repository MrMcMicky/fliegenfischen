import { SectionHeader } from "@/components/SectionHeader";

export const metadata = {
  title: "Rechtliches",
  description: "Datenschutz, AGB und Impressum der Fliegenfischerschule.",
};

export default function RechtlichesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Rechtliches"
        title="Datenschutz, AGB & Impressum"
        description="Diese Inhalte werden mit dem Kunden final abgestimmt. Platzhalter für den Relaunch."
      />
      <div className="space-y-6 rounded-xl border border-[var(--color-border)] bg-white p-8 text-sm text-[var(--color-muted)]">
        <div>
          <p className="font-semibold text-[var(--color-text)]">Datenschutz</p>
          <p className="mt-2">
            Informationen zur Datenverarbeitung, Cookies und Zahlungsanbieter.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text)]">AGB & Storno</p>
          <p className="mt-2">
            Regeln zu Buchung, Zahlung, Umbuchung und Rückerstattung.
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--color-text)]">Impressum</p>
          <p className="mt-2">
            Angaben zur Fliegenfischerschule, Kontakt und Haftungshinweise.
          </p>
        </div>
      </div>
    </div>
  );
}
