import Link from "next/link";

import { Button } from "@/components/Button";
import { CourseGrid } from "@/components/CourseGrid";
import { HeroSection } from "@/components/HeroSection";
import { SectionHeader } from "@/components/SectionHeader";
import { TestimonialSection } from "@/components/TestimonialSection";
import { TimelineSteps } from "@/components/TimelineSteps";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, upcomingSessions, reports] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.courseSession.findMany({
      where: { status: "VERFUEGBAR" },
      include: { course: true },
      orderBy: { date: "asc" },
      take: 3,
    }),
    prisma.report.findMany({ orderBy: { year: "desc" } }),
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
    contactCard: { title: string };
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
  const categorySummaries = (settings.categorySummaries as {
    title: string;
    description: string;
    href: string;
  }[]) || [];
  const contact = settings.contact as {
    address: string[];
    phone: string;
    mobile: string;
    email: string;
  };

  const nextSession = upcomingSessions[0] ?? null;

  return (
    <div className="space-y-20 pb-20">
      <HeroSection nextSession={nextSession} hero={homeHero} />

      <section className="mx-auto w-full max-w-5xl px-4 py-8">
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
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <SectionHeader
          eyebrow={homeSections.upcoming?.eyebrow}
          title={homeSections.upcoming?.title}
          description={homeSections.upcoming?.description}
        />
        <div className="mt-8">
          <CourseGrid sessions={upcomingSessions} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
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
      </section>

      <section id="ueber" className="mx-auto w-full max-w-5xl px-4 py-10">
        <SectionHeader
          eyebrow="Ueber uns"
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
            Mehr ueber uns
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <SectionHeader
          eyebrow={homeSections.timeline?.eyebrow}
          title={homeSections.timeline?.title}
          description={homeSections.timeline?.description}
        />
        <div className="mt-8">
          <TimelineSteps steps={coursePathSteps} />
        </div>
      </section>

      <TestimonialSection
        section={testimonialSection}
        testimonials={testimonials}
      />

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <SectionHeader
          eyebrow={homeSections.reports?.eyebrow}
          title={homeSections.reports?.title}
          description={homeSections.reports?.description}
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reports.map((report) => (
            <Link
              key={report.slug}
              href={`/berichte/${report.slug}`}
              className="rounded-xl border border-[var(--color-border)] bg-white p-6 transition hover:shadow-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                {report.location}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold text-[var(--color-text)]">
                {report.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {report.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-5xl px-4 py-10">
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
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
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
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
          <p className="font-semibold text-[var(--color-text)]">
            {homeSections.contactCard?.title}
          </p>
          <p className="mt-2">{contact.address?.[0]}</p>
          <p>{contact.address?.[1]}</p>
          <p className="mt-3">
            {contact.phone} · {contact.mobile}
          </p>
          <p>{contact.email}</p>
        </div>
      </section>
    </div>
  );
}
