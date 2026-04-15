import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/Button";
import { formatDate } from "@/lib/format";

const legacyHeroImage = "/illustrations/landing/mann-fliegenfischen.png";

export function HeroSection({
  nextSession,
  hero,
  compact = false,
  preview = false,
  media = "video",
  variant = "default",
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
  media?: "video" | "image";
  variant?: "default" | "legacy";
}) {
  const isLegacy = variant === "legacy";
  const pillClass =
    "inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1 text-xs font-semibold tracking-[0.25em] text-white backdrop-blur-sm";
  const baseOverlayClass = preview ? "bg-black/58" : "bg-black/34";
  const gradientOverlayClass = preview
    ? "bg-gradient-to-b from-black/44 via-black/52 to-[var(--color-stone)]"
    : "bg-gradient-to-b from-black/16 via-black/22 to-[var(--color-stone)]";

  if (isLegacy) {
    return (
      <section className="relative overflow-hidden bg-[var(--color-stone)]">
        <div className="relative min-h-[500px] sm:min-h-[620px] lg:min-h-[720px] xl:min-h-[760px]">
          <Image
            src={legacyHeroImage}
            alt="Urs Müller mit Schüler beim Fliegenfischen"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[20%_center] lg:object-[28%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/8 via-black/0 to-black/48" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-white/10" />

          <div className="relative z-10 mx-auto flex min-h-[500px] w-full max-w-7xl items-end px-4 py-10 sm:min-h-[620px] sm:px-6 sm:py-12 lg:min-h-[720px] lg:items-center lg:justify-end lg:px-10 lg:py-14 xl:min-h-[760px]">
            <div className="w-full max-w-[18rem] text-left text-white sm:max-w-[21rem] lg:max-w-[27rem]">
              <h1 className="font-display text-[2.25rem] font-semibold leading-[0.94] tracking-[-0.03em] text-white drop-shadow-[0_18px_38px_rgba(0,0,0,0.38)] sm:text-[2.95rem] lg:text-[3.12rem]">
                <span className="block">Herzlich</span>
                <span className="block">willkommen</span>
                <span className="block">in der</span>
                <span className="block">Fliegenfischer-</span>
                <span className="block">schule Urs Müller</span>
              </h1>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden ${
        compact
          ? "pt-24 pb-20"
          : "-mt-20 pt-28 pb-28 sm:pb-32 lg:pb-36"
      }`}
    >
      <div className="absolute inset-0 -z-10">
        {media === "image" ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/videos/hero-fliegenfischer.jpg')" }}
          />
        ) : (
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
        )}
        <div className={`absolute inset-0 ${baseOverlayClass}`} />
        <div className={`absolute inset-0 ${gradientOverlayClass}`} />
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 text-center text-white">
        {nextSession ? (
          preview ? (
            <span className={pillClass}>
              <span className="uppercase">Nächster Kurs</span>
              <span className="text-white/80">· {formatDate(nextSession.date)}</span>
            </span>
          ) : (
            <Link href="/kurse/termine" className={pillClass}>
              <span className="uppercase">Nächster Kurs</span>
              <span className="text-white/80">· {formatDate(nextSession.date)}</span>
            </Link>
          )
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
          <Button
            href={hero.primaryCta.href}
            variant="light"
            size="lg"
            disabled={preview}
          >
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant="light" size="lg" disabled={preview}>
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
