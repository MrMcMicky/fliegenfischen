import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/Button";
import { ContactForm } from "@/components/ContactForm";
import { CourseGrid } from "@/components/CourseGrid";
import { HeroSection } from "@/components/HeroSection";
import { SectionHeader } from "@/components/SectionHeader";
import { TestimonialSection } from "@/components/TestimonialSection";
import { TimelineSteps } from "@/components/TimelineSteps";
import { EditableImage, EditableText } from "@/components/admin/WysiwygEditable";
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

type FaqItem = {
  question: string;
  answer: string;
  editable: boolean;
  questionPath?: string;
  answerPath?: string;
  hint?: string;
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
    timeline?: { eyebrow?: string; title?: string; description?: string };
    reports?: { eyebrow?: string; title?: string; description?: string };
    private?: { eyebrow?: string; title?: string; description?: string };
    links?: { eyebrow?: string; title?: string; description?: string };
    weather?: { eyebrow?: string; title?: string; description?: string };
    contact?: { eyebrow?: string; title?: string; description?: string };
    privateFaqs?: { question?: string; answer?: string }[];
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
  const aboutPage = (settings.aboutPage ?? null) as {
    title?: string;
    intro?: string;
    bio?: string;
    highlights?: string[];
    values?: string[];
    cta?: {
      title?: string;
      description?: string;
      primary?: { label?: string; href?: string };
      secondary?: { label?: string; href?: string };
    };
  } | null;
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
  const privateSection = homeSections.private ?? {
    eyebrow: "Privatlektion",
    title: "Individuelles Coaching am Wasser",
    description:
      "Wir richten uns nach deinem Niveau: Technik verfeinern, Gewässer lesen lernen oder gezielt Fehler korrigieren.",
  };
  const linksSection = homeSections.links ?? {
    eyebrow: "Links",
    title: "Links & Berichte",
    description:
      "Empfehlungen zu Vereinen, Gewässern und Ausrüstung sowie Hinweise zu SFV und Instruktorenkursen.",
  };
  const weatherSection = homeSections.weather ?? {
    eyebrow: "Wetter",
    title: `Vorhersage für ${weather?.location || "Geroldswil"}`,
    description:
      "Wind, Niederschlag und Luftdruck – die wichtigsten Faktoren fürs Fliegenfischen.",
  };
  const contactSection = homeSections.contact ?? {
    eyebrow: "Kontakt",
    title: "Lass uns deinen Termin planen",
    description:
      "Melde dich per Telefon oder Mail. Wir beantworten Fragen zu Kursen, Ausrüstung und Terminen.",
  };
  const courseFormatFaqs = categorySummaries
    .filter((item) =>
      ["/kurse", "/schnupperstunden"].some((path) => item.href?.startsWith(path))
    )
    .map((item) => ({
      question: `Was beinhaltet ${item.title}?`,
      answer: item.description || "",
      editable: false,
      hint: "aus Kursformaten",
    }));
  const privateFormatFaqs = categorySummaries
    .filter((item) => item.href?.startsWith("/privatunterricht"))
    .map((item) => ({
      question: `Was beinhaltet ${item.title}?`,
      answer: item.description || "",
      editable: false,
      hint: "aus Kursformaten",
    }));
  const voucherFaqs = categorySummaries
    .filter((item) => item.href?.startsWith("/gutscheine"))
    .map((item) => ({
      question: "Gibt es Gutscheine?",
      answer: item.description || "",
      editable: false,
      hint: "aus Gutschein-Texten",
    }));
  const baseFaqs = faqs.map((faq, index) => ({
    question: faq.question || "",
    answer: faq.answer || "",
    editable: true,
    questionPath: `faqs.${index}.question`,
    answerPath: `faqs.${index}.answer`,
  }));
  const courseFaqs: FaqItem[] = [
    ...baseFaqs,
    ...courseFormatFaqs,
    ...voucherFaqs,
  ];
  const privateFaqOverrides = (homeSections.privateFaqs ?? []).filter(
    (item) => item?.question || item?.answer
  );
  const basePrivateFaqs: FaqItem[] = [
    {
      question: "Wie läuft eine Privatlektion ab?",
      answer:
        "Wir stimmen Ziel, Ort und Termin individuell ab. Am Wasser gibt es direktes Feedback, Übungen und klare nächste Schritte.",
      editable: true,
      questionPath: "homeSections.privateFaqs.0.question",
      answerPath: "homeSections.privateFaqs.0.answer",
    },
    {
      question: "Wie lange dauert eine Privatlektion?",
      answer: privateLesson
        ? `Mindestens ${privateLesson.minHours} Stunden. Danach entscheiden wir gemeinsam, wie lange es sinnvoll ist.`
        : "Mindestens 2 Stunden. Danach entscheiden wir gemeinsam, wie lange es sinnvoll ist.",
      editable: true,
      questionPath: "homeSections.privateFaqs.1.question",
      answerPath: "homeSections.privateFaqs.1.answer",
    },
    {
      question: "Brauche ich eigene Ausrüstung?",
      answer:
        "Ruten und Schnüre können auf Anfrage gestellt werden. Eigene Ausrüstung ist aber jederzeit willkommen.",
      editable: true,
      questionPath: "homeSections.privateFaqs.2.question",
      answerPath: "homeSections.privateFaqs.2.answer",
    },
  ];
  const privateFaqEditable = (privateFaqOverrides.length
    ? privateFaqOverrides.map((faq, index) => ({
        question: faq.question || "",
        answer: faq.answer || "",
        editable: true,
        questionPath: `homeSections.privateFaqs.${index}.question`,
        answerPath: `homeSections.privateFaqs.${index}.answer`,
      }))
    : basePrivateFaqs) as FaqItem[];
  const privateFaqs: FaqItem[] = privateLesson
    ? [
        ...privateFaqEditable,
        ...privateFormatFaqs.map((item) => ({
          ...item,
          hint: item.hint || "aus Kursformaten",
        })),
      ]
    : [];
  const nextSession = upcomingSessions[0] ?? null;
  const dayFormatter = new Intl.DateTimeFormat("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const renderDynamicPreview = (label: string, children: ReactNode) => (
    <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-white/60 p-4">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
        <span>{label}</span>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-[var(--color-muted)]">
          Dynamisch
        </span>
      </div>
      <div className="mt-3 pointer-events-none opacity-60">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Webpage Editor</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Texte direkt anklicken und bearbeiten. Änderungen werden automatisch gespeichert.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-stone)]">
        <HeroSection
          compact
          preview
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
            {renderDynamicPreview(
              "Kurs-Termine (automatisch)",
              <CourseGrid sessions={upcomingSessions} />
            )}
            {courseFaqs.length ? (
              <div className="mt-12">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                  FAQ
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
                  Häufige Fragen zu Kursen
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[var(--color-text)]">
                    Editierbar
                  </span>
                  <span className="rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1 text-[var(--color-muted)]">
                    Abgeleitet (read-only)
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {courseFaqs.map((faq, index) => (
                    <details
                      key={`course-faq-${index}`}
                      className={`group rounded-xl border border-[var(--color-border)] p-4 ${
                        faq.editable ? "bg-white/90" : "bg-white/70"
                      }`}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[var(--color-text)]">
                        <span>
                          {faq.editable ? (
                            <EditableText
                              path={faq.questionPath || ""}
                              value={faq.question}
                              placeholder="Frage"
                            />
                          ) : (
                            faq.question
                          )}
                        </span>
                        <span className="text-xl text-[var(--color-forest)] transition-transform duration-200 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="mt-3 text-sm text-[var(--color-muted)]">
                        {faq.editable ? (
                          <EditableText
                            path={faq.answerPath || ""}
                            value={faq.answer}
                            placeholder="Antwort"
                            multiline
                          />
                        ) : (
                          <p>{faq.answer}</p>
                        )}
                        {!faq.editable ? (
                          <p className="mt-2 text-xs text-[var(--color-muted)]/70">
                            Quelle: {faq.hint || "abgeleitet"}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-[var(--color-muted)]/70">
                            Editierbar (Basis‑FAQ).
                          </p>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                FAQ-Quellen (Kursformate)
              </p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Diese Inhalte fliessen in die FAQ-Bereiche bei Kursen,
                Privatlektionen und Gutscheinen ein.
              </p>
              <div className="mt-4 grid gap-6 md:grid-cols-3">
                {categorySummaries.map((category, index) => (
                  <div
                    key={`category-${index}`}
                    className="rounded-xl border border-[var(--color-border)] bg-white p-4"
                  >
                    <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">
                      <EditableText
                        path={`categorySummaries.${index}.title`}
                        value={category.title || ""}
                        placeholder="Titel"
                      />
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      <EditableText
                        path={`categorySummaries.${index}.description`}
                        value={category.description || ""}
                        placeholder="Beschreibung"
                        multiline
                      />
                    </p>
                    <p className="mt-3 text-xs text-[var(--color-muted)]">
                      Link-Ziel wird zentral verwaltet.
                    </p>
                  </div>
                ))}
              </div>
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
                eyebrow={
                  <EditableText
                    path="homeSections.private.eyebrow"
                    value={privateSection.eyebrow || ""}
                    placeholder="Eyebrow"
                  />
                }
                title={
                  <EditableText
                    path="homeSections.private.title"
                    value={privateSection.title || ""}
                    placeholder="Titel"
                  />
                }
                description={
                  <EditableText
                    path="homeSections.private.description"
                    value={privateSection.description || ""}
                    placeholder="Beschreibung"
                    multiline
                  />
                }
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
                  <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                    Dynamisch (Angebote)
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)]/70">
                    {privateLesson.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-[var(--color-muted)]/70">
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
                    Preis{" "}
                    <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
                      Dynamisch
                    </span>
                  </p>
                  <p className="mt-3 text-4xl font-semibold text-white/80">
                    {formatPrice(privateLesson.priceCHF)} / Std.
                  </p>
                  <p className="mt-3 text-sm text-white/60">
                    Mindestens {privateLesson.minHours} Stunden. Jede weitere Person +
                    {formatPrice(privateLesson.additionalPersonCHF)} / Std.
                  </p>
                  <div className="mt-6">
                    <Button href="/buchen?lesson=private" className="w-full" disabled>
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
              {privateFaqs.length ? (
                <div className="mt-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                    FAQ
                  </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
                  Häufige Fragen zu Privatlektionen
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-[var(--color-text)]">
                    Editierbar
                  </span>
                  <span className="rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1 text-[var(--color-muted)]">
                    Abgeleitet (read-only)
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {privateFaqs.map((faq, index) => (
                    <details
                      key={`private-faq-${index}`}
                      className={`group rounded-xl border border-[var(--color-border)] p-4 ${
                        faq.editable ? "bg-white/90" : "bg-white/70"
                      }`}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[var(--color-text)]">
                        <span>
                          {faq.editable ? (
                            <EditableText
                              path={faq.questionPath || ""}
                              value={faq.question}
                              placeholder="Frage"
                            />
                          ) : (
                            faq.question
                          )}
                        </span>
                        <span className="text-xl text-[var(--color-forest)] transition-transform duration-200 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="mt-3 text-sm text-[var(--color-muted)]">
                        {faq.editable ? (
                          <EditableText
                            path={faq.answerPath || ""}
                            value={faq.answer}
                            placeholder="Antwort"
                            multiline
                          />
                        ) : (
                          <p>{faq.answer}</p>
                        )}
                        {!faq.editable ? (
                          <p className="mt-2 text-xs text-[var(--color-muted)]/70">
                            Quelle: {faq.hint || "abgeleitet"}
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-[var(--color-muted)]/70">
                            Editierbar (Privat‑FAQ).
                          </p>
                        )}
                      </div>
                    </details>
                  ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section id="ueber" className="bg-white py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow="Über uns"
              title={
                <EditableText
                  path={aboutPage ? "aboutPage.title" : "aboutSection.title"}
                  value={aboutPage?.title || aboutSection.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path={aboutPage ? "aboutPage.intro" : "aboutSection.description"}
                  value={aboutPage?.intro || aboutSection.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
            />
            {aboutPage ? (
              <>
                <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="h-full rounded-xl border border-[var(--color-border)] bg-white p-3">
                    <div className="relative h-full min-h-[320px]">
                      <Image
                        src="/illustrations/urs-mueller.png"
                        alt="Urs Müller am Wasser"
                        fill
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex-1 space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
                      <p>
                        <EditableText
                          path="aboutPage.bio"
                          value={aboutPage.bio || ""}
                          placeholder="Bio"
                          multiline
                        />
                      </p>
                      <ul className="space-y-2">
                        {(aboutPage.values || []).map((value, index) => (
                          <li key={`about-value-${index}`}>
                            •{" "}
                            <EditableText
                              path={`aboutPage.values.${index}`}
                              value={value}
                              placeholder="Wert"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-1 rounded-2xl bg-[var(--color-forest)] p-6 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                        Qualifikation
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-white/80">
                        {(aboutPage.highlights || []).map((item, index) => (
                          <li key={`about-highlight-${index}`}>
                            •{" "}
                            <EditableText
                              path={`aboutPage.highlights.${index}`}
                              value={item}
                              placeholder="Highlight"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid gap-8 rounded-2xl border border-[var(--color-border)] bg-white p-10 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <h2 className="font-display text-3xl font-semibold text-[var(--color-text)]">
                      <EditableText
                        path="aboutPage.cta.title"
                        value={aboutPage.cta?.title || ""}
                        placeholder="CTA Titel"
                      />
                    </h2>
                    <p className="mt-3 text-sm text-[var(--color-muted)]">
                      <EditableText
                        path="aboutPage.cta.description"
                        value={aboutPage.cta?.description || ""}
                        placeholder="CTA Beschreibung"
                        multiline
                      />
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col gap-2">
                      <Button href={aboutPage.cta?.primary?.href || "#"} size="lg" disabled>
                        <EditableText
                          path="aboutPage.cta.primary.label"
                          value={aboutPage.cta?.primary?.label || ""}
                          placeholder="Button 1"
                        />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        href={aboutPage.cta?.secondary?.href || "#"}
                        variant="secondary"
                        size="lg"
                        disabled
                      >
                        <EditableText
                          path="aboutPage.cta.secondary.label"
                          value={aboutPage.cta?.secondary?.label || ""}
                          placeholder="Button 2"
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
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
            )}

          </div>
        </section>

        <section
          id="links"
          className="section-pattern bg-[var(--color-river-mist)] py-12"
        >
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow={
                <EditableText
                  path="homeSections.links.eyebrow"
                  value={linksSection.eyebrow || ""}
                  placeholder="Eyebrow"
                />
              }
              title={
                <EditableText
                  path="homeSections.links.title"
                  value={linksSection.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path="homeSections.links.description"
                  value={linksSection.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
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
            <div className="mt-12">
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
              {renderDynamicPreview(
                "Berichte (automatisch)",
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              )}
            </div>
          </div>
        </section>

        <section id="wetter" className="bg-white py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow={
                <EditableText
                  path="homeSections.weather.eyebrow"
                  value={weatherSection.eyebrow || ""}
                  placeholder="Eyebrow"
                />
              }
              title={
                <EditableText
                  path="homeSections.weather.title"
                  value={weatherSection.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path="homeSections.weather.description"
                  value={weatherSection.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
            />
            {renderDynamicPreview(
              "Wetterdaten (automatisch)",
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
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
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
                  <p className="text-sm text-[var(--color-muted)]">
                    Wetterdaten sind aktuell nicht verfügbar.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section id="kontakt" className="bg-[var(--color-pebble)] py-12">
          <div className="mx-auto w-full max-w-5xl px-4">
            <SectionHeader
              eyebrow={
                <EditableText
                  path="homeSections.contact.eyebrow"
                  value={contactSection.eyebrow || ""}
                  placeholder="Eyebrow"
                />
              }
              title={
                <EditableText
                  path="homeSections.contact.title"
                  value={contactSection.title || ""}
                  placeholder="Titel"
                />
              }
              description={
                <EditableText
                  path="homeSections.contact.description"
                  value={contactSection.description || ""}
                  placeholder="Beschreibung"
                  multiline
                />
              }
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
                <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
                    <span>Formular Vorschau</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white/70">
                      Dynamisch
                    </span>
                  </div>
                  <div className="mt-3 pointer-events-none opacity-70">
                    <ContactForm />
                  </div>
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
                  <Button href={homeSections.cta?.primary?.href || "#"} size="lg" disabled>
                    <EditableText
                      path="homeSections.cta.primary.label"
                      value={homeSections.cta?.primary?.label || ""}
                      placeholder="Button 1"
                    />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    href={homeSections.cta?.secondary?.href || "#"}
                    variant="secondary"
                    size="lg"
                    disabled
                  >
                    <EditableText
                      path="homeSections.cta.secondary.label"
                      value={homeSections.cta?.secondary?.label || ""}
                      placeholder="Button 2"
                    />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    href={homeSections.cta?.tertiary?.href || "#"}
                    variant="ghost"
                    size="lg"
                    disabled
                  >
                    <EditableText
                      path="homeSections.cta.tertiary.label"
                      value={homeSections.cta?.tertiary?.label || ""}
                      placeholder="Button 3"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
