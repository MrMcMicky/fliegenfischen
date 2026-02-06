import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/Button";
import { ContactForm } from "@/components/ContactForm";
import { CourseGrid } from "@/components/CourseGrid";
import { HeroSection } from "@/components/HeroSection";
import { SectionHeader } from "@/components/SectionHeader";
import { TestimonialSection } from "@/components/TestimonialSection";
import { TimelineSteps } from "@/components/TimelineSteps";
import {
  EditableImage,
  EditableInput,
  EditableText,
} from "@/components/admin/WysiwygEditable";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { resourceLinks, sfvLinks } from "@/lib/links";
import {
  formatWindDirection,
  getWeatherForecast,
  getWeatherIcon,
  getWeatherLabel,
  weatherLocations,
} from "@/lib/weather";

export const dynamic = "force-dynamic";

const extractFirstImage = (body: string) => {
  const match = body.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] || null;
};

const formatMetric = (value: number | null | undefined, unit: string) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${Math.round(value)}${unit}`;
};

export default async function AdminLandingWysiwygPage() {
  const selectedWeatherId = weatherLocations[0]?.id;
  const [settings, upcomingSessions, reports, privateLesson, weather] =
    await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
      prisma.courseSession.findMany({
        where: { status: "VERFUEGBAR" },
        include: { course: true },
        orderBy: { date: "asc" },
        take: 3,
      }),
      prisma.report.findMany({ orderBy: { year: "desc" } }),
      prisma.lessonOffering.findUnique({ where: { type: "PRIVATE" } }),
      selectedWeatherId ? getWeatherForecast(selectedWeatherId) : null,
    ]);
  const admin = await getAdminFromSession();
  const isSuperAdmin = admin?.role === "SUPER_ADMIN";

  if (!settings) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm">
        Keine Settings gefunden. Bitte Seed ausführen.
      </div>
    );
  }

  const homeHero = (settings.homeHero ?? {}) as {
    title?: string;
    description?: string;
    primaryCta?: { label?: string; href?: string };
    secondaryCta?: { label?: string; href?: string };
  };
  const homeSections = (settings.homeSections ?? {}) as {
    upcoming?: { eyebrow?: string; title?: string; description?: string };
    formats?: { eyebrow?: string; title?: string; description?: string };
    timeline?: { eyebrow?: string; title?: string; description?: string };
    reports?: { eyebrow?: string; title?: string; description?: string };
    faq?: { eyebrow?: string; title?: string; description?: string };
    media?: { privateLessonImage?: string; contactMapImage?: string };
    cta?: {
      title?: string;
      description?: string;
      note?: string;
      primary?: { label?: string; href?: string };
      secondary?: { label?: string; href?: string };
      tertiary?: { label?: string; href?: string };
    };
  };
  const media = homeSections.media || {};
  const privateLessonImage =
    media.privateLessonImage || "/illustrations/private-lessons.png";
  const contactMapImage =
    media.contactMapImage || "/illustrations/contact-map.png";
  const uspItems = (settings.uspItems ?? []) as {
    title?: string;
    description?: string;
  }[];
  const aboutSection = (settings.aboutSection ?? {}) as {
    title?: string;
    description?: string;
    highlights?: string[];
    note?: string;
  };
  const faqs = (settings.faqs ?? []) as { question?: string; answer?: string }[];
  const testimonials = (settings.testimonials ?? []) as {
    quote?: string;
    author?: string;
  }[];
  const testimonialSection = (settings.testimonialSection ?? {}) as {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
  const coursePathSteps = (settings.coursePathSteps ?? []) as {
    step?: string;
    title?: string;
    detail?: string;
  }[];
  const contact =
    (settings.contact as {
      instructor?: string;
      address?: string[];
      phone?: string;
      mobile?: string;
      email?: string;
    }) || {
      instructor: "",
      address: ["", ""],
      phone: "",
      mobile: "",
      email: "",
    };
  const categorySummaries = (settings.categorySummaries ?? []) as {
    title?: string;
    description?: string;
    href?: string;
  }[];
  const nextSession = upcomingSessions[0] ?? null;
  const dayFormatter = new Intl.DateTimeFormat("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const renderLinkInput = (
    path: string,
    value: string,
    placeholder: string
  ) => {
    if (isSuperAdmin) {
      return (
        <EditableInput
          path={path}
          value={value}
          placeholder={placeholder}
          className="w-full"
        />
      );
    }
    return (
      <div className="wysiwyg-input w-full bg-[var(--color-stone)] text-[var(--color-muted)]">
        {value || "—"}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Landing Page WYSIWYG</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Texte direkt anklicken und bearbeiten. Änderungen werden automatisch gespeichert.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-stone)]">
        <HeroSection
          compact
          nextSession={nextSession}
          hero={{
            title: (
              <EditableText
                path="homeHero.title"
                value={homeHero.title || ""}
                className="block min-w-[8rem]"
                placeholder="Hero Titel"
              />
            ),
            description: (
              <EditableText
                path="homeHero.description"
                value={homeHero.description || ""}
                className="block min-w-[12rem]"
                placeholder="Hero Beschreibung"
                multiline
              />
            ),
            primaryCta: {
              label: (
                <EditableText
                  path="homeHero.primaryCta.label"
                  value={homeHero.primaryCta?.label || ""}
                  placeholder="Primärer Button"
                />
              ),
              href: homeHero.primaryCta?.href || "#",
            },
            secondaryCta: {
              label: (
                <EditableText
                  path="homeHero.secondaryCta.label"
                  value={homeHero.secondaryCta?.label || ""}
                  placeholder="Sekundärer Button"
                />
              ),
              href: homeHero.secondaryCta?.href || "#",
            },
          }}
        />

        <div className="mx-auto w-full max-w-5xl px-4 pb-8">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 text-xs text-[var(--color-muted)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              Hero Button-Links
            </p>
            {!isSuperAdmin ? (
              <p className="mt-2 text-[11px] text-[var(--color-muted)]">
                Links können nur vom Super Admin geändert werden.
              </p>
            ) : null}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Primär</p>
                {renderLinkInput(
                  "homeHero.primaryCta.href",
                  homeHero.primaryCta?.href || "",
                  "/kurse/termine"
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Sekundär</p>
                {renderLinkInput(
                  "homeHero.secondaryCta.href",
                  homeHero.secondaryCta?.href || "",
                  "/buchen?lesson=private"
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 text-xs text-[var(--color-muted)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              Landing-Bilder
            </p>
            <p className="mt-2 text-[11px] text-[var(--color-muted)]">
              Diese Illustrationen erscheinen auf der Startseite bei Privatlektion
              und Kontakt.
            </p>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <EditableImage
                path="homeSections.media.privateLessonImage"
                value={privateLessonImage}
                label="Privatlektion Illustration"
                placeholder="/illustrations/private-lessons.png"
              />
              <EditableImage
                path="homeSections.media.contactMapImage"
                value={contactMapImage}
                label="Kontakt Illustration"
                placeholder="/illustrations/contact-map.png"
              />
            </div>
          </div>
        </div>

        <section className="bg-white py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {uspItems.map((item, index) => (
                <div
                  key={`usp-${index}`}
                  className="rounded-xl border border-[var(--color-border)] bg-white p-6"
                >
                  <h3 className="font-display text-xl font-semibold text-[var(--color-text)]">
                    <EditableText
                      path={`uspItems.${index}.title`}
                      value={item.title || ""}
                      placeholder="USP Titel"
                    />
                  </h3>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    <EditableText
                      path={`uspItems.${index}.description`}
                      value={item.description || ""}
                      placeholder="USP Beschreibung"
                      multiline
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="kurse" className="bg-[var(--color-river-mist)] py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow={
                <EditableText
                  path="homeSections.upcoming.eyebrow"
                  value={homeSections.upcoming?.eyebrow || ""}
                  placeholder="Eyebrow"
                />
              }
              title={
                <EditableText
                  path="homeSections.upcoming.title"
                  value={homeSections.upcoming?.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path="homeSections.upcoming.description"
                  value={homeSections.upcoming?.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
            />
            <div className="mt-8">
              <CourseGrid sessions={upcomingSessions} />
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow={
                <EditableText
                  path="homeSections.formats.eyebrow"
                  value={homeSections.formats?.eyebrow || ""}
                  placeholder="Eyebrow"
                />
              }
              title={
                <EditableText
                  path="homeSections.formats.title"
                  value={homeSections.formats?.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path="homeSections.formats.description"
                  value={homeSections.formats?.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
            />
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {categorySummaries.map((category, index) => (
                <div
                  key={`category-${index}`}
                  className="rounded-xl border border-[var(--color-border)] bg-white p-6"
                >
                  <h3 className="font-display text-xl font-semibold text-[var(--color-text)]">
                    <EditableText
                      path={`categorySummaries.${index}.title`}
                      value={category.title || ""}
                      placeholder="Titel"
                    />
                  </h3>
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    <EditableText
                      path={`categorySummaries.${index}.description`}
                      value={category.description || ""}
                      placeholder="Beschreibung"
                      multiline
                    />
                  </p>
                  <div className="mt-4 text-xs text-[var(--color-muted)]">
                    {renderLinkInput(
                      `categorySummaries.${index}.href`,
                      category.href || "",
                      "/kurse/termine"
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TestimonialSection
          section={{
            eyebrow: (
              <EditableText
                path="testimonialSection.eyebrow"
                value={testimonialSection.eyebrow || ""}
                placeholder="Eyebrow"
              />
            ),
            title: (
              <EditableText
                path="testimonialSection.title"
                value={testimonialSection.title || ""}
                placeholder="Titel"
              />
            ),
            description: (
              <EditableText
                path="testimonialSection.description"
                value={testimonialSection.description || ""}
                placeholder="Beschreibung"
                multiline
              />
            ),
          }}
          testimonials={testimonials.map((item, index) => ({
            quote: (
              <EditableText
                path={`testimonials.${index}.quote`}
                value={item.quote || ""}
                placeholder="Zitat"
                multiline
              />
            ),
            author: (
              <EditableText
                path={`testimonials.${index}.author`}
                value={item.author || ""}
                placeholder="Autor"
              />
            ),
          }))}
        />

        {privateLesson ? (
          <section id="privat" className="bg-[var(--color-sage)] py-12">
            <div className="mx-auto w-full max-w-5xl px-4">
              <SectionHeader
                eyebrow="Privatlektion"
                title="Individuelles Coaching am Wasser"
                description="Wir richten uns nach deinem Niveau: Technik verfeinern, Gewässer lesen lernen oder gezielt Fehler korrigieren."
              />
              <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
                    <Image
                      src={privateLessonImage}
                      alt="Illustration Privatlektion"
                      width={720}
                      height={480}
                      className="h-48 w-full object-contain"
                    />
                  </div>
                  <p className="mt-5 text-sm text-[var(--color-muted)]">
                    {privateLesson.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-[var(--color-muted)]">
                    {privateLesson.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-ember)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="h-fit rounded-2xl bg-[var(--color-forest)] p-8 text-white shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                    Preis
                  </p>
                  <p className="mt-3 text-4xl font-semibold">
                    {formatPrice(privateLesson.priceCHF)} / Std.
                  </p>
                  <p className="mt-3 text-sm text-white/70">
                    Mindestens {privateLesson.minHours} Stunden. Jede weitere Person +
                    {formatPrice(privateLesson.additionalPersonCHF)} / Std.
                  </p>
                  <div className="mt-6">
                    <Button href="/buchen?lesson=private" className="w-full">
                      Privatlektion buchen
                    </Button>
                  </div>
                  <div className="mt-6 text-sm text-white/80">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                      Fragen?
                    </p>
                    {contact.phone ? (
                      <p className="mt-2">Tel. {contact.phone}</p>
                    ) : null}
                    {contact.mobile ? <p>Natel {contact.mobile}</p> : null}
                  </div>
                </div>
              </div>
              <div className="mt-14">
                <SectionHeader
                  eyebrow={
                    <EditableText
                      path="homeSections.timeline.eyebrow"
                      value={homeSections.timeline?.eyebrow || ""}
                      placeholder="Eyebrow"
                    />
                  }
                  title={
                    <EditableText
                      path="homeSections.timeline.title"
                      value={homeSections.timeline?.title || ""}
                      placeholder="Titel"
                    />
                  }
                  description={
                    <EditableText
                      path="homeSections.timeline.description"
                      value={homeSections.timeline?.description || ""}
                      placeholder="Beschreibung"
                      multiline
                    />
                  }
                />
                <div className="mt-8">
                  <TimelineSteps
                    steps={coursePathSteps.map((step, index) => ({
                      step: (
                        <EditableText
                          path={`coursePathSteps.${index}.step`}
                          value={step.step || ""}
                          placeholder="Stufe"
                        />
                      ),
                      title: (
                        <EditableText
                          path={`coursePathSteps.${index}.title`}
                          value={step.title || ""}
                          placeholder="Titel"
                        />
                      ),
                      detail: (
                        <EditableText
                          path={`coursePathSteps.${index}.detail`}
                          value={step.detail || ""}
                          placeholder="Detail"
                          multiline
                        />
                      ),
                    }))}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section id="ueber" className="bg-white py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow="Über uns"
              title={
                <EditableText
                  path="aboutSection.title"
                  value={aboutSection.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path="aboutSection.description"
                  value={aboutSection.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {(aboutSection.highlights || []).map((item, index) => (
                <div
                  key={`about-${index}`}
                  className="rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm text-[var(--color-muted)]"
                >
                  <EditableText
                    path={`aboutSection.highlights.${index}`}
                    value={item}
                    placeholder="Highlight"
                    multiline
                  />
                </div>
              ))}
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm text-[var(--color-muted)]">
                <EditableText
                  path="aboutSection.note"
                  value={aboutSection.note || ""}
                  placeholder="Notiz"
                  multiline
                />
              </div>
            </div>

          </div>
        </section>

        <section id="berichte" className="bg-white py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow={
                <EditableText
                  path="homeSections.reports.eyebrow"
                  value={homeSections.reports?.eyebrow || ""}
                  placeholder="Eyebrow"
                />
              }
              title={
                <EditableText
                  path="homeSections.reports.title"
                  value={homeSections.reports?.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path="homeSections.reports.description"
                  value={homeSections.reports?.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => {
                const heroImage =
                  report.coverImage || extractFirstImage(report.body || "");
                return (
                  <Link
                    key={report.slug}
                    href={`/berichte/${report.slug}`}
                    className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-6 transition hover:shadow-lg"
                  >
                    {heroImage ? (
                      <div
                        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
                        style={{ backgroundImage: `url(${heroImage})` }}
                      />
                    ) : null}
                    <div className="relative z-10">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                        {report.location} · {report.year}
                      </p>
                      <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
                        {report.title}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {report.summary}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="bg-[var(--color-pebble)] py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow={
                <EditableText
                  path="homeSections.faq.eyebrow"
                  value={homeSections.faq?.eyebrow || ""}
                  placeholder="Eyebrow"
                />
              }
              title={
                <EditableText
                  path="homeSections.faq.title"
                  value={homeSections.faq?.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path="homeSections.faq.description"
                  value={homeSections.faq?.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {faqs.map((faq, index) => (
                <div
                  key={`faq-${index}`}
                  className="rounded-xl border border-[var(--color-border)] bg-white p-5"
                >
                  <p className="font-semibold text-[var(--color-text)]">
                    <EditableText
                      path={`faqs.${index}.question`}
                      value={faq.question || ""}
                      placeholder="Frage"
                    />
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    <EditableText
                      path={`faqs.${index}.answer`}
                      value={faq.answer || ""}
                      placeholder="Antwort"
                      multiline
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="links"
          className="section-pattern bg-[var(--color-river-mist)] py-12"
        >
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow="Links"
              title="Wissenswertes & Partner"
              description="Empfehlungen zu Vereinen, Gewässern und Ausrüstung sowie Hinweise zu SFV und Instruktorenkursen."
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {resourceLinks.map((group) => (
                <div
                  key={group.title}
                  className="rounded-xl border border-[var(--color-border)] bg-white p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                    {group.title}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[var(--color-forest)] transition hover:text-[var(--color-ember)]"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-forest)] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  SFV
                </p>
                <p className="mt-3 text-sm text-white/80">
                  Offizielle Verbandsinfos und Hinweise zu Instruktorenkursen.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {sfvLinks.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-white transition hover:text-[var(--color-ember)]"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="wetter" className="bg-white py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow="Wetter"
              title={`Vorhersage für ${weather?.location || "Geroldswil"}`}
              description="Wind, Niederschlag und Luftdruck – die wichtigsten Faktoren fürs Fliegenfischen."
            />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {weatherLocations.map((location) => {
                const isActive = location.id === selectedWeatherId;
                return (
                  <Link
                    key={location.id}
                    href={`/?w=${location.id}#wetter`}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-[var(--color-ember)]/60 bg-[var(--color-ember)]/10 text-[var(--color-forest)]"
                        : "border-[var(--color-border)] bg-white text-[var(--color-forest)] hover:border-[var(--color-ember)]/40 hover:text-[var(--color-ember)]"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {location.label}
                  </Link>
                );
              })}
              <span className="text-xs text-[var(--color-muted)]">
                Standard: Schulstandort Geroldswil.
              </span>
            </div>
            {weather ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                        Aktuell in {weather.location}
                      </p>
                      <div className="mt-3 flex items-baseline gap-3">
                        <p className="text-4xl font-semibold text-[var(--color-text)]">
                          {formatMetric(weather.current?.temperature ?? null, "°")}
                        </p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {getWeatherLabel(weather.current?.weatherCode ?? null)}
                        </p>
                      </div>
                    </div>
                    <div className="text-4xl">
                      {getWeatherIcon(weather.current?.weatherCode ?? null)}
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                        Wind
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {formatMetric(weather.current?.windSpeed ?? null, " km/h")} {" "}
                        {weather.current?.windDirection != null
                          ? `(${formatWindDirection(weather.current.windDirection)})`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                        Luftdruck
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {formatMetric(weather.current?.pressure ?? null, " hPa")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                        Niederschlag
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {formatMetric(weather.current?.precipitation ?? null, " mm")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                        Höhe
                      </p>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {formatMetric(weather.elevation ?? null, " m")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-xs text-[var(--color-muted)]">
                    Quelle: MeteoSwiss ICON CH1 (Open-Meteo)
                  </p>
                </div>
                <div className="space-y-4">
                  {weather.days.map((day) => (
                    <div
                      key={day.date}
                      className="rounded-xl border border-[var(--color-border)] bg-white p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                            {dayFormatter.format(new Date(day.date))}
                          </p>
                          <p className="mt-2 text-sm text-[var(--color-muted)]">
                            {getWeatherLabel(day.weatherCode)}
                          </p>
                        </div>
                        <div className="text-2xl">
                          {getWeatherIcon(day.weatherCode)}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-muted)]">
                        <span>
                          {formatMetric(day.tempMax, "°")} / {formatMetric(day.tempMin, "°")}
                        </span>
                        <span>
                          Regen {formatMetric(day.precipitationSum, " mm")}
                        </span>
                        <span>
                          Wind {formatMetric(day.windMax ?? null, " km/h")}
                        </span>
                        {day.precipitationProb != null ? (
                          <span>{Math.round(day.precipitationProb)}% Regen</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-[var(--color-muted)]">
                Wetterdaten sind aktuell nicht verfügbar.
              </p>
            )}
          </div>
        </section>

        <section id="kontakt" className="bg-[var(--color-pebble)] py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow="Kontakt"
              title="Lass uns deinen Termin planen"
              description="Melde dich per Telefon oder Mail. Wir beantworten Fragen zu Kursen, Ausrüstung und Terminen."
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
                <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
                  <Image
                    src={contactMapImage}
                    alt="Illustration Treffpunkt und Limmat"
                    width={720}
                    height={480}
                    className="h-40 w-full object-contain sm:h-48"
                  />
                </div>
                <p className="font-semibold text-[var(--color-text)]">
                  <EditableText
                    path="contact.instructor"
                    value={contact.instructor || ""}
                    placeholder="Name"
                  />
                </p>
                <p>
                  <EditableText
                    path="contact.address.0"
                    value={contact.address?.[0] || ""}
                    placeholder="Adresse Zeile 1"
                  />
                </p>
                <p>
                  <EditableText
                    path="contact.address.1"
                    value={contact.address?.[1] || ""}
                    placeholder="Adresse Zeile 2"
                  />
                </p>
                <p className="mt-4">
                  Tel.{" "}
                  <EditableText
                    path="contact.phone"
                    value={contact.phone || ""}
                    placeholder="Telefon"
                  />
                </p>
                <p>
                  Natel{" "}
                  <EditableText
                    path="contact.mobile"
                    value={contact.mobile || ""}
                    placeholder="Mobile"
                  />
                </p>
                <p>
                  <EditableText
                    path="contact.email"
                    value={contact.email || ""}
                    placeholder="E-Mail"
                  />
                </p>
                <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                    Treffpunkt
                  </p>
                  <p className="mt-2">
                    Kursdetails und genaue Treffpunkte senden wir mit der
                    Bestätigungsmail.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-[var(--color-forest)] p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                  Anfrage
                </p>
                <p className="mt-3 text-sm text-white/70">
                  Teile uns kurz dein Ziel und mögliche Termine mit. Wir melden uns
                  innert 48 Stunden.
                </p>
                <div className="mt-6 pointer-events-none opacity-70">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <div className="grid gap-8 rounded-2xl border border-[var(--color-border)] bg-white p-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="font-display text-3xl font-semibold text-[var(--color-text)]">
                  <EditableText
                    path="homeSections.cta.title"
                    value={homeSections.cta?.title || ""}
                    placeholder="CTA Titel"
                  />
                </h2>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  <EditableText
                    path="homeSections.cta.description"
                    value={homeSections.cta?.description || ""}
                    placeholder="CTA Beschreibung"
                    multiline
                  />
                </p>
                <div className="mt-4 text-sm text-[var(--color-forest)]/70">
                  <EditableText
                    path="homeSections.cta.note"
                    value={homeSections.cta?.note || ""}
                    placeholder="CTA Notiz"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-2">
                  <Button href={homeSections.cta?.primary?.href || "#"} size="lg">
                    <EditableText
                      path="homeSections.cta.primary.label"
                      value={homeSections.cta?.primary?.label || ""}
                      placeholder="Button 1"
                    />
                  </Button>
                  {renderLinkInput(
                    "homeSections.cta.primary.href",
                    homeSections.cta?.primary?.href || "",
                    "/kontakt"
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    href={homeSections.cta?.secondary?.href || "#"}
                    variant="secondary"
                    size="lg"
                  >
                    <EditableText
                      path="homeSections.cta.secondary.label"
                      value={homeSections.cta?.secondary?.label || ""}
                      placeholder="Button 2"
                    />
                  </Button>
                  {renderLinkInput(
                    "homeSections.cta.secondary.href",
                    homeSections.cta?.secondary?.href || "",
                    "/schnupperstunden"
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    href={homeSections.cta?.tertiary?.href || "#"}
                    variant="ghost"
                    size="lg"
                  >
                    <EditableText
                      path="homeSections.cta.tertiary.label"
                      value={homeSections.cta?.tertiary?.label || ""}
                      placeholder="Button 3"
                    />
                  </Button>
                  {renderLinkInput(
                    "homeSections.cta.tertiary.href",
                    homeSections.cta?.tertiary?.href || "",
                    "/gutscheine"
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
