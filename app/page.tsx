import Link from "next/link";

import { Button } from "@/components/Button";
import { CourseGrid } from "@/components/CourseGrid";
import { HeroSection } from "@/components/HeroSection";
import { SectionHeader } from "@/components/SectionHeader";
import { TestimonialSection } from "@/components/TestimonialSection";
import { TimelineSteps } from "@/components/TimelineSteps";
import { categorySummaries, getUpcomingSessions } from "@/lib/courses";
import {
  aboutSection,
  faqs,
  homeSections,
  reports,
  siteConfig,
  uspItems,
} from "@/lib/data";
import { Award, Fish, MapPin, Users } from "lucide-react";

const upcomingSessions = getUpcomingSessions().slice(0, 3);
const nextSession = upcomingSessions[0] ?? null;
const uspIcons = [Users, Award, Fish, MapPin];

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      <HeroSection nextSession={nextSession} />

      <section className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {uspItems.map((item, index) => {
            const Icon = uspIcons[index % uspIcons.length];
            return (
            <div
              key={item.title}
              className="flex flex-col items-center rounded-xl border border-[var(--color-border)] bg-white p-6 text-center"
            >
              <Icon size={20} className="mb-3 text-[var(--color-ember)]" />
              <h3 className="font-display text-xl font-semibold text-[var(--color-text)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {item.description}
              </p>
            </div>
          )})}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <SectionHeader
          eyebrow={homeSections.upcoming.eyebrow}
          title={homeSections.upcoming.title}
          description={homeSections.upcoming.description}
        />
        <div className="mt-8">
          <CourseGrid sessions={upcomingSessions} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <SectionHeader
          eyebrow={homeSections.formats.eyebrow}
          title={homeSections.formats.title}
          description={homeSections.formats.description}
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
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <SectionHeader
          eyebrow={homeSections.timeline.eyebrow}
          title={homeSections.timeline.title}
          description={homeSections.timeline.description}
        />
        <div className="mt-8">
          <TimelineSteps />
        </div>
      </section>

      <TestimonialSection />

      <section className="mx-auto w-full max-w-5xl px-4 py-10">
        <SectionHeader
          eyebrow={homeSections.reports.eyebrow}
          title={homeSections.reports.title}
          description={homeSections.reports.description}
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
          eyebrow={homeSections.faq.eyebrow}
          title={homeSections.faq.title}
          description={homeSections.faq.description}
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

      <section className="bg-[var(--color-forest)] py-16">
        <div className="mx-auto w-full max-w-5xl px-4 text-white">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold">
                {homeSections.cta.title}
              </h2>
              <p className="mt-3 text-sm text-white/80">
                {homeSections.cta.description}
              </p>
              <div className="mt-4 text-sm text-white/70">
                {homeSections.cta.note}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button href={homeSections.cta.primary.href} size="lg">
                {homeSections.cta.primary.label}
              </Button>
              <Button href={homeSections.cta.secondary.href} variant="light" size="lg">
                {homeSections.cta.secondary.label}
              </Button>
              <Button href={homeSections.cta.tertiary.href} variant="ghostLight" size="lg">
                {homeSections.cta.tertiary.label}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
          <p className="font-semibold text-[var(--color-text)]">
            {homeSections.contactCard.title}
          </p>
          <p className="mt-2">{siteConfig.contact.address[0]}</p>
          <p>{siteConfig.contact.address[1]}</p>
          <p className="mt-3">{siteConfig.contact.phone} · {siteConfig.contact.mobile}</p>
          <p>{siteConfig.contact.email}</p>
        </div>
      </section>
    </div>
  );
}
