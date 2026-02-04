import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

type CtaLink = { label?: string; href?: string };
type HeroContent = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
};
type AboutContent = {
  title?: string;
  description?: string;
  note?: string;
  highlights?: string[];
};
type SectionContent = {
  eyebrow?: string;
  title?: string;
  description?: string;
};
type CtaContent = {
  title?: string;
  description?: string;
  note?: string;
  primary?: CtaLink;
  secondary?: CtaLink;
  tertiary?: CtaLink;
};
type HomeSectionsContent = Record<string, SectionContent> & {
  cta?: CtaContent;
  contactCard?: Prisma.InputJsonValue;
};

const textValue = (value: unknown) =>
  typeof value === "string" ? value : "";

export default async function AdminFrontpageTextPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  if (!settings) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm">
        Keine Settings gefunden. Bitte Seed ausführen.
      </div>
    );
  }

  const homeHero = (settings.homeHero ?? {}) as HeroContent;
  const aboutSection = (settings.aboutSection ?? {}) as AboutContent;
  const homeSections = (settings.homeSections ?? {}) as HomeSectionsContent;
  const contactCard = (homeSections.contactCard ?? null) as Prisma.InputJsonValue | null;

  async function updateFrontpage(formData: FormData) {
    "use server";

    const hero = {
      eyebrow: String(formData.get("hero.eyebrow") || "").trim(),
      title: String(formData.get("hero.title") || "").trim(),
      description: String(formData.get("hero.description") || "").trim(),
      primaryCta: {
        label: String(formData.get("hero.primary.label") || "").trim(),
        href: String(formData.get("hero.primary.href") || "").trim(),
      },
      secondaryCta: {
        label: String(formData.get("hero.secondary.label") || "").trim(),
        href: String(formData.get("hero.secondary.href") || "").trim(),
      },
    };

    const about = {
      title: String(formData.get("about.title") || "").trim(),
      description: String(formData.get("about.description") || "").trim(),
      note: String(formData.get("about.note") || "").trim(),
      highlights: parseLines(String(formData.get("about.highlights") || "")),
    };

    const section = (key: string) => ({
      eyebrow: String(formData.get(`${key}.eyebrow`) || "").trim(),
      title: String(formData.get(`${key}.title`) || "").trim(),
      description: String(formData.get(`${key}.description`) || "").trim(),
    });

    const cta = {
      title: String(formData.get("cta.title") || "").trim(),
      description: String(formData.get("cta.description") || "").trim(),
      note: String(formData.get("cta.note") || "").trim(),
      primary: {
        label: String(formData.get("cta.primary.label") || "").trim(),
        href: String(formData.get("cta.primary.href") || "").trim(),
      },
      secondary: {
        label: String(formData.get("cta.secondary.label") || "").trim(),
        href: String(formData.get("cta.secondary.href") || "").trim(),
      },
      tertiary: {
        label: String(formData.get("cta.tertiary.label") || "").trim(),
        href: String(formData.get("cta.tertiary.href") || "").trim(),
      },
    };

    await prisma.siteSettings.update({
      where: { id: 1 },
      data: {
        homeHero: hero,
        aboutSection: about,
        homeSections: {
          ...homeSections,
          upcoming: section("upcoming"),
          formats: section("formats"),
          timeline: section("timeline"),
          reports: section("reports"),
          faq: section("faq"),
          cta,
          contactCard,
        } as Prisma.InputJsonValue,
      },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold">
          Texte Frontpage
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Inhalte der Startseite bearbeiten. Änderungen wirken sofort auf die
          öffentliche Startseite.
        </p>
      </div>

      <form action={updateFrontpage} className="space-y-8">
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Hero</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Bereich ganz oben auf der Startseite (Headline, Text, Buttons).
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="hero.eyebrow" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Eyebrow (kleine Überschrift)
              </label>
              <input
                id="hero.eyebrow"
                name="hero.eyebrow"
                defaultValue={textValue(homeHero.eyebrow)}
                placeholder="z. B. Fliegenfischerschule"
                className="form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="hero.title" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Haupttitel (H1)
              </label>
              <input
                id="hero.title"
                name="hero.title"
                defaultValue={textValue(homeHero.title)}
                placeholder="z. B. Fliegenfischen in der Region Zürich — ruhig, präzise, draussen."
                className="form-input px-3 py-2"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="hero.description" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Kurzbeschreibung (1–2 Sätze)
            </label>
            <textarea
              id="hero.description"
              name="hero.description"
              defaultValue={textValue(homeHero.description)}
              placeholder="Kurzer Einleitungstext unter dem Titel."
              className="w-full form-input px-3 py-2"
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="hero.primary.label" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Primärer Button – Text
              </label>
              <input
                id="hero.primary.label"
                name="hero.primary.label"
                defaultValue={textValue(homeHero.primaryCta?.label)}
                placeholder="z. B. Gruppenkurse entdecken"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Leerlassen blendet den Button aus.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="hero.primary.href" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Primärer Button – Link (URL)
              </label>
              <input
                id="hero.primary.href"
                name="hero.primary.href"
                defaultValue={textValue(homeHero.primaryCta?.href)}
                placeholder="z. B. /kurse/termine"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Interne Links bitte mit / beginnen.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="hero.secondary.label" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Sekundärer Button – Text
              </label>
              <input
                id="hero.secondary.label"
                name="hero.secondary.label"
                defaultValue={textValue(homeHero.secondaryCta?.label)}
                placeholder="z. B. Privatlektion buchen"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Leerlassen blendet den Button aus.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="hero.secondary.href" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Sekundärer Button – Link (URL)
              </label>
              <input
                id="hero.secondary.href"
                name="hero.secondary.href"
                defaultValue={textValue(homeHero.secondaryCta?.href)}
                placeholder="z. B. /buchen?lesson=private"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Interne Links bitte mit / beginnen.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">
              Über-Urs Teaser
            </h3>
            <p className="text-xs text-[var(--color-muted)]">
              Kurzblock auf der Startseite, der auf die Über‑uns‑Seite verweist.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="about.title" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Titel
              </label>
              <input
                id="about.title"
                name="about.title"
                defaultValue={textValue(aboutSection.title)}
                placeholder="z. B. Über Urs Müller"
                className="form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="about.note" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Kurznotiz (rechts oben)
              </label>
              <input
                id="about.note"
                name="about.note"
                defaultValue={textValue(aboutSection.note)}
                placeholder="z. B. Treffpunkte entlang der Limmat..."
                className="form-input px-3 py-2"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="about.description" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Beschreibung (1–2 Sätze)
            </label>
            <textarea
              id="about.description"
              name="about.description"
              defaultValue={textValue(aboutSection.description)}
              placeholder="Kurzer Text unter dem Titel."
              className="w-full form-input px-3 py-2"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="about.highlights" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Highlights (Liste)
            </label>
            <textarea
              id="about.highlights"
              name="about.highlights"
              defaultValue={(aboutSection.highlights || []).join("\n")}
              placeholder="Eine Zeile pro Punkt (z. B. Kleine Gruppen, Praxis am Wasser, ...)"
              className="w-full form-input px-3 py-2"
              rows={3}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Sektionen</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Überschriften und Kurztexte für die einzelnen Startseiten‑Abschnitte.
            </p>
          </div>
          {[
            { key: "upcoming", label: "Nächste Kurse" },
            { key: "formats", label: "Kursformate" },
            { key: "timeline", label: "Lernpfad" },
            { key: "reports", label: "Berichte" },
            { key: "faq", label: "FAQ" },
          ].map((section) => {
            const data = homeSections[section.key] || {};
            return (
              <div key={section.key} className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  {section.label}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor={`${section.key}.eyebrow`} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      Eyebrow (kleiner Label‑Text)
                    </label>
                    <input
                      id={`${section.key}.eyebrow`}
                      name={`${section.key}.eyebrow`}
                      defaultValue={textValue(data.eyebrow)}
                      placeholder="z. B. Termine"
                      className="form-input px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`${section.key}.title`} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      Titel
                    </label>
                    <input
                      id={`${section.key}.title`}
                      name={`${section.key}.title`}
                      defaultValue={textValue(data.title)}
                      placeholder="z. B. Nächste Kurse"
                      className="form-input px-3 py-2"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={`${section.key}.description`} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Kurzbeschreibung
                  </label>
                  <textarea
                    id={`${section.key}.description`}
                    name={`${section.key}.description`}
                    defaultValue={textValue(data.description)}
                    placeholder="1–2 Sätze für den Abschnitt."
                    className="w-full form-input px-3 py-2"
                    rows={2}
                  />
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">CTA Abschnitt</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Der Abschluss‑Block „Bereit für den nächsten Schritt?“.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="cta.title" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Titel
              </label>
              <input
                id="cta.title"
                name="cta.title"
                defaultValue={textValue(homeSections.cta?.title)}
                placeholder="z. B. Bereit für den nächsten Schritt?"
                className="form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cta.note" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Kurznotiz (optional)
              </label>
              <input
                id="cta.note"
                name="cta.note"
                defaultValue={textValue(homeSections.cta?.note)}
                placeholder="z. B. Antwort i. d. R. innert 48h"
                className="form-input px-3 py-2"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="cta.description" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Beschreibung (1–2 Sätze)
            </label>
            <textarea
              id="cta.description"
              name="cta.description"
              defaultValue={textValue(homeSections.cta?.description)}
              placeholder="Kurztext unter dem Titel."
              className="w-full form-input px-3 py-2"
              rows={3}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="cta.primary.label" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Button 1 – Text
              </label>
              <input
                id="cta.primary.label"
                name="cta.primary.label"
                defaultValue={textValue(homeSections.cta?.primary?.label)}
                placeholder="z. B. Kontakt aufnehmen"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Leerlassen blendet den Button aus.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cta.primary.href" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Button 1 – Link (URL)
              </label>
              <input
                id="cta.primary.href"
                name="cta.primary.href"
                defaultValue={textValue(homeSections.cta?.primary?.href)}
                placeholder="z. B. /kontakt"
                className="form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cta.secondary.label" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Button 2 – Text
              </label>
              <input
                id="cta.secondary.label"
                name="cta.secondary.label"
                defaultValue={textValue(homeSections.cta?.secondary?.label)}
                placeholder="z. B. Schnuppern"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Leerlassen blendet den Button aus.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cta.secondary.href" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Button 2 – Link (URL)
              </label>
              <input
                id="cta.secondary.href"
                name="cta.secondary.href"
                defaultValue={textValue(homeSections.cta?.secondary?.href)}
                placeholder="z. B. /schnupperstunden"
                className="form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cta.tertiary.label" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Button 3 – Text (optional)
              </label>
              <input
                id="cta.tertiary.label"
                name="cta.tertiary.label"
                defaultValue={textValue(homeSections.cta?.tertiary?.label)}
                placeholder="z. B. Gutscheine"
                className="form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cta.tertiary.href" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Button 3 – Link (URL)
              </label>
              <input
                id="cta.tertiary.href"
                name="cta.tertiary.href"
                defaultValue={textValue(homeSections.cta?.tertiary?.href)}
                placeholder="z. B. /gutscheine"
                className="form-input px-3 py-2"
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-[var(--color-ember)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
