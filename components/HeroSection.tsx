import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/Button";
import type { CourseSession } from "@/lib/courses";
import { homeHero } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type HeroSectionProps = {
  nextSession?: CourseSession | null;
};

export function HeroSection({ nextSession }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pb-16 pt-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--color-ember)]/15 blur-3xl" />
        <div className="absolute -right-16 top-0 h-80 w-80 rounded-full bg-[var(--color-forest)]/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[120%] -translate-x-1/2 bg-gradient-to-t from-white/70 to-transparent" />
        <svg
          className="absolute bottom-0 left-0 w-full text-[var(--color-forest)]/10"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 C240,200 480,40 720,120 C960,200 1200,40 1440,120"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M0,170 C240,90 480,210 720,170 C960,130 1200,230 1440,170"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
          />
        </svg>
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/70">
          {homeHero.eyebrow}
        </p>
        <h1 className="mt-6 font-display text-4xl font-semibold text-[var(--color-text)] sm:text-5xl lg:text-6xl">
          {homeHero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-muted)] sm:text-lg">
          {homeHero.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href={homeHero.primaryCta.href} size="lg">
            {homeHero.primaryCta.label}
          </Button>
          <Button href={homeHero.secondaryCta.href} variant="secondary" size="lg">
            {homeHero.secondaryCta.label}
          </Button>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <Image
            src="/illustrations/hero-river.svg"
            alt="Illustration Fluss und Wellen"
            width={1200}
            height={260}
            priority
            className="h-32 w-full rounded-2xl object-contain sm:h-40"
          />
        </div>
        <div className="mt-6 text-sm text-[var(--color-forest)]/70">
          {nextSession ? (
            <Link
              href="/kurse/termine"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]/70 transition hover:text-[var(--color-forest)]"
            >
              <span>Naechster Kurs</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ember)]" />
              <span>{formatDate(nextSession.date)}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]/70">
              Termine auf Anfrage
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
