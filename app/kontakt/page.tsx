import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Kontakt",
  description: "Kontakt und Standort der Fliegenfischerschule.",
};

export default function KontaktPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-6 pb-24 pt-16">
      <SectionHeader
        eyebrow="Kontakt"
        title="Lass uns deinen Termin planen"
        description="Melde dich per Telefon oder Mail. Wir beantworten Fragen zu Kursen, Ausruestung und Terminen."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-[var(--color-forest)]/70">
          <p className="font-semibold text-[var(--color-forest)]">
            {siteConfig.contact.instructor}
          </p>
          <p>{siteConfig.contact.address[0]}</p>
          <p>{siteConfig.contact.address[1]}</p>
          <p className="mt-4">Tel. {siteConfig.contact.phone}</p>
          <p>Natel {siteConfig.contact.mobile}</p>
          <p>{siteConfig.contact.email}</p>
          <div className="mt-6 rounded-2xl bg-[var(--color-mist)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
              Treffpunkt
            </p>
            <p className="mt-2">
              Kursdetails und genaue Treffpunkte senden wir mit der
              Bestaetigungsmail.
            </p>
          </div>
        </div>
        <div className="rounded-3xl bg-[var(--color-forest)] p-8 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Anfrage
          </p>
          <p className="mt-3 text-sm text-white/70">
            Formular folgt in Phase 2. Bis dahin gerne per Mail oder Telefon.
          </p>
          <div className="mt-6">
            <Button href={`mailto:${siteConfig.contact.email}`} variant="secondary">
              Mail senden
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
