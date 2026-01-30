import Link from "next/link";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import {
  categorySummaries,
  getUpcomingSessions,
} from "@/lib/courses";
import { reports } from "@/lib/reports";
import { coursePathSteps, faqs, siteConfig, uspItems } from "@/lib/site";
import { formatDate, formatPrice } from "@/lib/utils";

const upcomingSessions = getUpcomingSessions().slice(0, 3);

export default function Home() {
  return (
    <div className="space-y-24 pb-24">
      <section className="relative overflow-hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-12 pt-20 lg:grid lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Badge>Fliegenfischen Schule</Badge>
            <h1 className="font-display text-4xl font-semibold text-[var(--color-forest)] sm:text-5xl lg:text-6xl">
              Fliegenfischen & Flycasting lernen in Zuerich am Wasser.
            </h1>
            <p className="max-w-xl text-base text-[var(--color-forest)]/70 sm:text-lg">
              Technik, Ruhe und Natur verbinden. Kurse fuer Einhand und Zweihand,
              kleine Gruppen und klare Lernpfade. Unterwegs an der Limmat mit
              zertifiziertem Instruktor.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/kurse" size="lg">
                Kurse ansehen
              </Button>
              <Button href="/gutscheine" variant="secondary" size="lg">
                Gutschein kaufen
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/80 p-5 shadow-[0_20px_60px_rgba(12,43,42,0.08)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
                  Standort
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-forest)]">
                  {siteConfig.location}
                </p>
                <p className="text-sm text-[var(--color-forest)]/60">
                  Treffpunkt je nach Kurs, Details per Mail.
                </p>
              </div>
              <div className="rounded-3xl bg-white/80 p-5 shadow-[0_20px_60px_rgba(12,43,42,0.08)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
                  Kontakt
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-forest)]">
                  {siteConfig.contact.phone} · {siteConfig.contact.mobile}
                </p>
                <p className="text-sm text-[var(--color-forest)]/60">
                  {siteConfig.contact.email}
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-12 top-0 h-48 w-48 rounded-full bg-[var(--color-ember)]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] bg-[var(--color-forest)] px-8 py-10 text-white shadow-[0_30px_80px_rgba(12,43,42,0.4)]">
              <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute -right-14 bottom-0 h-40 w-40 rounded-full bg-white/10" />
              <div className="relative space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Naechster Termin
                  </p>
                  {upcomingSessions[0] ? (
                    <p className="mt-3 text-2xl font-semibold">
                      {formatDate(upcomingSessions[0].date)}
                    </p>
                  ) : (
                    <p className="mt-3 text-2xl font-semibold">Auf Anfrage</p>
                  )}
                  <p className="text-sm text-white/70">
                    {upcomingSessions[0]?.location}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-semibold">Kursuebersicht</p>
                  <p className="text-xs text-white/70">
                    Einhand, Zweihand, Privat und Schnupperstunden.
                  </p>
                </div>
                <Button href="/kurse" variant="secondary">
                  Termine sichern
                </Button>
              </div>
            </div>
            <div className="absolute -bottom-8 right-6 hidden w-56 rounded-2xl bg-white p-4 text-sm text-[var(--color-forest)] shadow-[0_20px_60px_rgba(12,43,42,0.12)] lg:block animate-drift">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
                Gruppenlimit
              </p>
              <p className="mt-2 font-semibold">Max. 6 Teilnehmende</p>
              <p className="text-xs text-[var(--color-forest)]/60">
                So bleibt Zeit fuer individuelles Feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {uspItems.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(12,43,42,0.08)]"
            >
              <h3 className="font-display text-xl font-semibold text-[var(--color-forest)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-[var(--color-forest)]/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="Termine"
            title="Naechste Kurse"
            description="Frueh buchen lohnt sich: Die Gruppen bleiben klein, die Plaetze sind limitiert."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {upcomingSessions.map((session, index) => (
              <div
                key={session.id}
                className={`animate-fade-up delay-${index * 150} rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(12,43,42,0.08)]`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
                  {session.location}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold">
                  {formatDate(session.date)}
                </h3>
                <p className="text-sm text-[var(--color-forest)]/70">
                  {session.startTime} - {session.endTime}
                </p>
                <p className="mt-4 text-lg font-semibold text-[var(--color-forest)]">
                  {formatPrice(session.priceCHF)}
                </p>
                <p className="text-xs text-[var(--color-forest)]/60">
                  Noch {session.availableSpots} Plaetze
                </p>
                <Button href="/kurse" variant="secondary" className="mt-6">
                  Details ansehen
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeader
            eyebrow="Angebot"
            title="Kursformate fuer jedes Level"
            description="Einhand oder Zweihand, Privat oder Schnuppern: Wir bauen gemeinsam Technik auf, Schritt fuer Schritt."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {categorySummaries.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="rounded-3xl border border-white/60 bg-white/80 p-6 transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(12,43,42,0.16)]"
              >
                <h3 className="font-display text-xl font-semibold text-[var(--color-forest)]">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--color-forest)]/70">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionHeader
            eyebrow="Lernpfad"
            title="So bauen wir Technik und Praxis auf"
            description="Von der Materialkunde bis zur Praxis am Wasser. Jeder Kurs bringt dich einen Schritt weiter."
          />
          <div className="space-y-4">
            {coursePathSteps.map((step) => (
              <div
                key={step.step}
                className="rounded-3xl border border-white/60 bg-white/90 p-5"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
                  {step.step}
                </p>
                <p className="mt-2 font-semibold text-[var(--color-forest)]">
                  {step.title}
                </p>
                <p className="text-sm text-[var(--color-forest)]/70">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-[32px] bg-[var(--color-forest)] p-10 text-white shadow-[0_30px_80px_rgba(12,43,42,0.4)]">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                Stimmen
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold">
                Klarer Aufbau, spuerbarer Fortschritt.
              </h2>
              <p className="mt-4 text-sm text-white/70">
                Kleine Gruppen sorgen dafuer, dass jeder Wurf gesehen wird. Das Ziel: Technik, die auch am Wasser funktioniert.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm">
                  &ldquo;Nach zwei Stunden sass der Doppelzug endlich. Sehr
                  praezise Korrekturen.&rdquo;
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/70">
                  Teilnehmer Einhandkurs
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 p-5">
                <p className="text-sm">
                  &ldquo;Schnupperstunde gebucht und sofort Lust auf mehr. Super
                  ruhige Erklaerungen.&rdquo;
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/70">
                  Teilnehmerin Schnupperstunde
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <SectionHeader
          eyebrow="Wissen"
          title="Berichte und Einblicke"
          description="Reiseberichte und Gewaesser-Notizen aus der Praxis. Ideal fuer SEO und Inspiration."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reports.map((report) => (
            <Link
              key={report.slug}
              href={`/berichte/${report.slug}`}
              className="rounded-3xl border border-white/60 bg-white/80 p-6 transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(12,43,42,0.16)]"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
                {report.location}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold">
                {report.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-forest)]/70">
                {report.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionHeader
            eyebrow="FAQ"
            title="Haefige Fragen"
            description="Kurz und klar beantwortet. Fuer Details gerne direkt melden."
          />
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-3xl border border-white/60 bg-white/90 p-5"
              >
                <p className="font-semibold text-[var(--color-forest)]">
                  {faq.question}
                </p>
                <p className="mt-2 text-sm text-[var(--color-forest)]/70">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 rounded-[32px] border border-white/70 bg-white/90 p-10 shadow-[0_30px_80px_rgba(12,43,42,0.14)] lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold text-[var(--color-forest)]">
              Bereit fuer den naechsten Schritt?
            </h2>
            <p className="mt-3 text-sm text-[var(--color-forest)]/70">
              Sichere dir einen Platz oder verschenke einen Gutschein. Wir melden uns mit allen Details.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button href="/kurse" size="lg">
              Termin buchen
            </Button>
            <Button href="/gutscheine" variant="secondary" size="lg">
              Gutschein bestellen
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
