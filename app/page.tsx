import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/Button";
import { ContactForm } from "@/components/ContactForm";
import { CourseGrid } from "@/components/CourseGrid";
import { HeroSection } from "@/components/HeroSection";
import { SectionHeader } from "@/components/SectionHeader";
import { TestimonialSection } from "@/components/TestimonialSection";
import { TimelineSteps } from "@/components/TimelineSteps";
import { UspIcon } from "@/components/UspIcon";
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

export default async function Home({
  searchParams,
}: {
  searchParams?: { w?: string } | URLSearchParams | Promise<unknown>;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const params =
    resolvedParams && typeof (resolvedParams as { get?: unknown }).get === "function"
      ? Object.fromEntries(
          (resolvedParams as URLSearchParams).entries()
        )
      : (resolvedParams ?? {});

  const rawWeatherParam = Array.isArray((params as { w?: string }).w)
    ? (params as { w?: string[] }).w?.[0]
    : (params as { w?: string }).w;
  const selectedWeatherId =
    rawWeatherParam &&
    weatherLocations.some((loc) => loc.id === rawWeatherParam)
      ? rawWeatherParam
      : weatherLocations[0]?.id;
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
      getWeatherForecast(selectedWeatherId),
    ]);

  if (!settings) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-20">
        <p className="text-sm text-[var(--color-muted)]">
          Inhalte werden vorbereitet.
        </p>
      </div>
    );
  }

  const homeHero = settings.homeHero as {
    title: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  const homeSections = settings.homeSections as {
    upcoming: { eyebrow: string; title: string; description: string };
    formats: { eyebrow: string; title: string; description: string };
    timeline: { eyebrow: string; title: string; description: string };
    reports: { eyebrow: string; title: string; description: string };
    faq: { eyebrow: string; title: string; description: string };
    cta: {
      title: string;
      description: string;
      note: string;
      primary: { label: string; href: string };
      secondary: { label: string; href: string };
      tertiary: { label: string; href: string };
    };
    media?: {
      privateLessonImage?: string;
      contactMapImage?: string;
    };
  };
  const uspItems = settings.uspItems as { title: string; description: string }[];
  const aboutSection = settings.aboutSection as {
    title: string;
    description: string;
    highlights: string[];
    note: string;
  };
  const faqs = settings.faqs as { question: string; answer: string }[];
  const testimonials = settings.testimonials as {
    quote: string;
    author: string;
  }[];
  const testimonialSection = settings.testimonialSection as {
    eyebrow: string;
    title: string;
    description: string;
  };
  const coursePathSteps = settings.coursePathSteps as {
    step: string;
    title: string;
    detail: string;
  }[];
  const media = homeSections.media || {};
  const privateLessonImage =
    media.privateLessonImage || "/illustrations/private-lessons.png";
  const contactMapImage =
    media.contactMapImage || "/illustrations/contact-map.png";
  const courseFaqs = faqs;
  const privateFaqs = privateLesson
    ? [
        {
          question: "Wie läuft eine Privatlektion ab?",
          answer:
            "Wir stimmen Ziel, Ort und Termin individuell ab. Am Wasser gibt es direktes Feedback, Übungen und klare nächste Schritte.",
        },
        {
          question: "Wie lange dauert eine Privatlektion?",
          answer: `Mindestens ${privateLesson.minHours} Stunden. Danach entscheiden wir gemeinsam, wie lange es sinnvoll ist.`,
        },
        {
          question: "Brauche ich eigene Ausrüstung?",
          answer:
            "Ruten und Schnüre können auf Anfrage gestellt werden. Eigene Ausrüstung ist aber jederzeit willkommen.",
        },
      ]
    : [];
  const contact =
    (settings.contact as {
      instructor: string;
      address: string[];
      phone: string;
      mobile: string;
      email: string;
    }) || {
      instructor: "",
      address: ["", ""],
      phone: "",
      mobile: "",
      email: "",
    };
  const categorySummaries = (settings.categorySummaries as {
    title: string;
    description: string;
    href: string;
  }[]) || [];
  const nextSession = upcomingSessions[0] ?? null;
  const dayFormatter = new Intl.DateTimeFormat("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="pb-20">
      <HeroSection nextSession={nextSession} hero={homeHero} />

      <section className="bg-white pb-14 pt-12 -mt-12 sm:-mt-16 lg:-mt-20">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {uspItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 text-center shadow-[0_18px_24px_-8px_rgba(15,50,49,0.08),0_8px_12px_-6px_rgba(15,50,49,0.06)]"
              >
                <UspIcon title={item.title} />
                <h3 className="mt-4 font-display text-xl font-semibold text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kurse" className="bg-[var(--color-river-mist)] py-12">
        <div className="mx-auto w-full max-w-5xl px-4">
          <SectionHeader
            eyebrow={homeSections.upcoming?.eyebrow}
            title={homeSections.upcoming?.title}
            description={homeSections.upcoming?.description}
          />
          <div className="mt-8">
            <CourseGrid sessions={upcomingSessions} />
          </div>
          {courseFaqs.length ? (
            <div className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                FAQ
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
                Häufige Fragen zu Kursen
              </h3>
              <div className="mt-5 space-y-3">
                {courseFaqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border border-[var(--color-border)] bg-white/90 p-4"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[var(--color-text)]">
                      <span>{faq.question}</span>
                      <span className="text-xl text-[var(--color-forest)] transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-[var(--color-muted)]">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto w-full max-w-5xl px-4">
          <SectionHeader
            eyebrow={homeSections.formats?.eyebrow}
            title={homeSections.formats?.title}
            description={homeSections.formats?.description}
          />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {categorySummaries.map((category) => (
              <Link
                key={category.title}
                href={category.href}
                className="rounded-xl border border-[var(--color-border)] bg-white p-6 transition hover:shadow-lg"
              >
                <h3 className="font-display text-xl font-semibold text-[var(--color-text)]">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TestimonialSection
        section={testimonialSection}
        testimonials={testimonials}
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
                eyebrow={homeSections.timeline?.eyebrow}
                title={homeSections.timeline?.title}
                description={homeSections.timeline?.description}
              />
              <div className="mt-8">
                <TimelineSteps steps={coursePathSteps} />
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
                <div className="mt-5 space-y-3">
                  {privateFaqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="group rounded-xl border border-[var(--color-border)] bg-white/90 p-4"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[var(--color-text)]">
                        <span>{faq.question}</span>
                        <span className="text-xl text-[var(--color-forest)] transition-transform duration-200 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-sm text-[var(--color-muted)]">
                        {faq.answer}
                      </p>
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
            title={aboutSection.title}
            description={aboutSection.description}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {aboutSection.highlights.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm text-[var(--color-muted)]"
              >
                {item}
              </div>
            ))}
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm text-[var(--color-muted)]">
              {aboutSection.note}
            </div>
          </div>
          <div className="mt-6">
            <Button href="/ueber-uns" variant="secondary" size="sm">
              Mehr über uns
            </Button>
          </div>
        </div>
      </section>

      <section id="berichte" className="bg-[var(--color-river-mist)] py-12">
        <div className="mx-auto w-full max-w-5xl px-4">
          <SectionHeader
            eyebrow={homeSections.reports?.eyebrow}
            title={homeSections.reports?.title}
            description={homeSections.reports?.description}
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

      <section
        id="links"
        className="section-pattern bg-[var(--color-pebble)] py-12"
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
                <a
                  key={location.id}
                  href={`/?w=${location.id}#wetter`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-[var(--color-forest)] bg-[var(--color-forest)] text-white shadow-sm"
                      : "border-[var(--color-border)] bg-white text-[var(--color-forest)] hover:border-[var(--color-forest)]/40 hover:text-[var(--color-forest)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {location.label}
                </a>
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
                      {formatMetric(weather.current?.windSpeed ?? null, " km/h")}{" "}
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
                        {formatMetric(day.tempMax, "°")} /{" "}
                        {formatMetric(day.tempMin, "°")}
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
                {contact.instructor}
              </p>
              <p>{contact.address[0]}</p>
              <p>{contact.address[1]}</p>
              {contact.phone ? <p className="mt-4">Tel. {contact.phone}</p> : null}
              {contact.mobile ? <p>Natel {contact.mobile}</p> : null}
              {contact.email ? <p>{contact.email}</p> : null}
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
              <div className="mt-6">
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
                {homeSections.cta?.title}
              </h2>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {homeSections.cta?.description}
              </p>
              <div className="mt-4 text-sm text-[var(--color-forest)]/70">
                {homeSections.cta?.note}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button href={homeSections.cta?.primary?.href} size="lg">
                {homeSections.cta?.primary?.label}
              </Button>
              <Button
                href={homeSections.cta?.secondary?.href}
                variant="secondary"
                size="lg"
              >
                {homeSections.cta?.secondary?.label}
              </Button>
              <Button
                href={homeSections.cta?.tertiary?.href}
                variant="ghost"
                size="lg"
              >
                {homeSections.cta?.tertiary?.label}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
