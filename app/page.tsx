import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/Button";
import { ContactForm } from "@/components/ContactForm";
import { CourseGrid } from "@/components/CourseGrid";
import { HeroSection } from "@/components/HeroSection";
import { SectionHeader } from "@/components/SectionHeader";
import { TestimonialSection } from "@/components/TestimonialSection";
import { TimelineSteps } from "@/components/TimelineSteps";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const extractFirstImage = (body: string) => {
  const match = body.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] || null;
};

export default async function Home() {
  const [settings, upcomingSessions, reports, privateLesson] =
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

  return (
    <div className="pb-20">
      <HeroSection nextSession={nextSession} hero={homeHero} />

      <section className="bg-white/70 py-12">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {uspItems.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--color-border)] bg-white p-6"
              >
                <h3 className="font-display text-xl font-semibold text-[var(--color-text)]">
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

      <section id="kurse" className="bg-[var(--color-mist)] py-12">
        <div className="mx-auto w-full max-w-5xl px-4">
          <SectionHeader
            eyebrow={homeSections.upcoming?.eyebrow}
            title={homeSections.upcoming?.title}
            description={homeSections.upcoming?.description}
          />
          <div className="mt-8">
            <CourseGrid sessions={upcomingSessions} />
          </div>
        </div>
      </section>

      <section className="bg-white/70 py-12">
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

      {privateLesson ? (
        <section id="privat" className="bg-[var(--color-mist)] py-12">
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
                    src="/illustrations/private-lessons.png"
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
          </div>
        </section>
      ) : null}

      <section id="ueber" className="bg-white/70 py-12">
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

      <section className="bg-[var(--color-mist)] py-12">
        <div className="mx-auto w-full max-w-5xl px-4">
          <SectionHeader
            eyebrow={homeSections.timeline?.eyebrow}
            title={homeSections.timeline?.title}
            description={homeSections.timeline?.description}
          />
          <div className="mt-8">
            <TimelineSteps steps={coursePathSteps} />
          </div>
        </div>
      </section>

      <TestimonialSection
        section={testimonialSection}
        testimonials={testimonials}
      />

      <section id="berichte" className="bg-white/70 py-12">
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

      <section id="faq" className="bg-[var(--color-mist)] py-12">
        <div className="mx-auto w-full max-w-5xl px-4">
          <SectionHeader
            eyebrow={homeSections.faq?.eyebrow}
            title={homeSections.faq?.title}
            description={homeSections.faq?.description}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-[var(--color-border)] bg-white p-5"
              >
                <p className="font-semibold text-[var(--color-text)]">
                  {faq.question}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kontakt" className="bg-white/70 py-12">
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
                  src="/illustrations/contact-map.png"
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

      <section className="bg-[var(--color-mist)] py-12">
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
