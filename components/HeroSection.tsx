import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/Button";
import { formatDate } from "@/lib/format";

export function HeroSection({
  nextSession,
  hero,
  compact = false,
  preview = false,
}: {
  nextSession?: { date: Date } | null;
  hero: {
    title: ReactNode;
    description: ReactNode;
    primaryCta: { label: ReactNode; href: string };
    secondaryCta: { label: ReactNode; href: string };
  };
  compact?: boolean;
  preview?: boolean;
}) {
  const pillClass =
    "inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1 text-xs font-semibold tracking-[0.25em] text-white backdrop-blur-sm";
  const baseOverlayClass = preview ? "bg-black/65" : "bg-black/50";
  const gradientOverlayClass = preview
    ? "bg-gradient-to-b from-black/50 via-black/60 to-[var(--color-stone)]"
    : "bg-gradient-to-b from-black/30 via-black/40 to-[var(--color-stone)]";

  return (
    <section
      className={`relative overflow-hidden ${
        compact
          ? "pt-24 pb-20"
          : "-mt-20 pt-28 pb-28 sm:pb-32 lg:pb-36"
      }`}
    >
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
        <div className={`absolute inset-0 ${baseOverlayClass}`} />
        <div className={`absolute inset-0 ${gradientOverlayClass}`} />
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 text-center text-white">
        {nextSession ? (
          <Link href="/kurse/termine" className={pillClass}>
            <span className="uppercase">Nächster Kurs</span>
            <span className="text-white/80">· {formatDate(nextSession.date)}</span>
          </Link>
        ) : (
          <p className={pillClass}>Termine auf Anfrage</p>
        )}
        <h1 className="mt-6 font-display text-4xl font-semibold drop-shadow-md sm:text-5xl lg:text-6xl">
          {hero.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 drop-shadow-md sm:text-lg">
          {hero.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href={hero.primaryCta.href} size="lg">
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant="light" size="lg">
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
