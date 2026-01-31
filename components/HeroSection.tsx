import Link from "next/link";

import { Button } from "@/components/Button";
import { formatDate } from "@/lib/format";

export function HeroSection({
  nextSession,
  hero,
}: {
  nextSession?: { date: Date } | null;
  hero: {
    title: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
}) {
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
          poster="/videos/hero-fliegenfischer.jpg"
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
            Naechster Kurs · {formatDate(nextSession.date)}
          </Link>
        ) : (
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-ember)]">
            Termine auf Anfrage
          </p>
        )}
        <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl lg:text-6xl">
          {hero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
          {hero.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href={hero.primaryCta.href} size="lg">
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
