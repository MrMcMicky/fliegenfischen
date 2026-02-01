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
          Inhalte der Startseite bearbeiten (ohne JSON).
        </p>
      </div>

      <form action={updateFrontpage} className="space-y-8">
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <h3 className="font-display text-lg font-semibold">Hero</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="hero.eyebrow"
              defaultValue={textValue(homeHero.eyebrow)}
              placeholder="Eyebrow"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="hero.title"
              defaultValue={textValue(homeHero.title)}
              placeholder="Titel"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
          </div>
          <textarea
            name="hero.description"
            defaultValue={textValue(homeHero.description)}
            placeholder="Beschreibung"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            rows={3}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="hero.primary.label"
              defaultValue={textValue(homeHero.primaryCta?.label)}
              placeholder="Primary Button Text"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="hero.primary.href"
              defaultValue={textValue(homeHero.primaryCta?.href)}
              placeholder="Primary Button Link"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="hero.secondary.label"
              defaultValue={textValue(homeHero.secondaryCta?.label)}
              placeholder="Secondary Button Text"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="hero.secondary.href"
              defaultValue={textValue(homeHero.secondaryCta?.href)}
              placeholder="Secondary Button Link"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <h3 className="font-display text-lg font-semibold">
            Über-Urs Teaser
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="about.title"
              defaultValue={textValue(aboutSection.title)}
              placeholder="Titel"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="about.note"
              defaultValue={textValue(aboutSection.note)}
              placeholder="Hinweis"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
          </div>
          <textarea
            name="about.description"
            defaultValue={textValue(aboutSection.description)}
            placeholder="Beschreibung"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            rows={3}
          />
          <textarea
            name="about.highlights"
            defaultValue={(aboutSection.highlights || []).join("\n")}
            placeholder="Highlights (eine Zeile pro Punkt)"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            rows={3}
          />
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <h3 className="font-display text-lg font-semibold">Sektionen</h3>
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
                  <input
                    name={`${section.key}.eyebrow`}
                    defaultValue={textValue(data.eyebrow)}
                    placeholder="Eyebrow"
                    className="rounded-lg border border-[var(--color-border)] px-3 py-2"
                  />
                  <input
                    name={`${section.key}.title`}
                    defaultValue={textValue(data.title)}
                    placeholder="Titel"
                    className="rounded-lg border border-[var(--color-border)] px-3 py-2"
                  />
                </div>
                <textarea
                  name={`${section.key}.description`}
                  defaultValue={textValue(data.description)}
                  placeholder="Beschreibung"
                  className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
                  rows={2}
                />
              </div>
            );
          })}
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <h3 className="font-display text-lg font-semibold">CTA Abschnitt</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="cta.title"
              defaultValue={textValue(homeSections.cta?.title)}
              placeholder="Titel"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="cta.note"
              defaultValue={textValue(homeSections.cta?.note)}
              placeholder="Hinweis"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
          </div>
          <textarea
            name="cta.description"
            defaultValue={textValue(homeSections.cta?.description)}
            placeholder="Beschreibung"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            rows={3}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="cta.primary.label"
              defaultValue={textValue(homeSections.cta?.primary?.label)}
              placeholder="Primary Button Text"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="cta.primary.href"
              defaultValue={textValue(homeSections.cta?.primary?.href)}
              placeholder="Primary Button Link"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="cta.secondary.label"
              defaultValue={textValue(homeSections.cta?.secondary?.label)}
              placeholder="Secondary Button Text"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="cta.secondary.href"
              defaultValue={textValue(homeSections.cta?.secondary?.href)}
              placeholder="Secondary Button Link"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="cta.tertiary.label"
              defaultValue={textValue(homeSections.cta?.tertiary?.label)}
              placeholder="Tertiary Button Text"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <input
              name="cta.tertiary.href"
              defaultValue={textValue(homeSections.cta?.tertiary?.href)}
              placeholder="Tertiary Button Link"
              className="rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-[var(--color-forest)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
