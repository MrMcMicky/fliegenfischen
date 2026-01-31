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
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/illustrations/hero-river.svg"
        >
          <source src="/videos/hero-fliegenfischer.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-[var(--color-stone)]" />
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 text-center text-white">
        {nextSession ? (
          <Link
            href="/kurse/termine"
            className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-ember)]"
          >
            Nächster Kurs · {formatDate(nextSession.date)}
          </Link>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-ember)]">
            Termine auf Anfrage
          </p>
        )}
        <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl lg:text-6xl">
          {homeHero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
          {homeHero.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href={homeHero.primaryCta.href} size="lg">
            {homeHero.primaryCta.label}
          </Button>
          <Button href={homeHero.secondaryCta.href} variant="light" size="lg">
            {homeHero.secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
