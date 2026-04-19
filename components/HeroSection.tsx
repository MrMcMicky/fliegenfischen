import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/Button";
import { formatDate } from "@/lib/format";

export function HeroSection({
  nextSession,
  hero,
  compact = false,
  preview = false,
  media = "video",
  heroImage,
  hideBadge = false,
}: {
  nextSession?: { date: Date } | null;
  hero: {
    title: ReactNode;
    description?: ReactNode;
    primaryCta: { label: ReactNode; href: string };
    secondaryCta: { label: ReactNode; href: string };
  };
  compact?: boolean;
  preview?: boolean;
  media?: "video" | "image";
  heroImage?: string;
  hideBadge?: boolean;
}) {
  const pillClass =
    "inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1 text-xs font-semibold tracking-[0.25em] text-white backdrop-blur-sm";
  const hasCustomImage = !!heroImage;
  const backgroundImage = heroImage || "/videos/hero-fliegenfischer.jpg";
  const baseOverlayClass = hasCustomImage
    ? "bg-black/40"
    : preview
      ? "bg-black/58"
      : "bg-black/34";
  const gradientOverlayClass = hasCustomImage
    ? "bg-gradient-to-b from-black/25 via-black/38 to-[var(--color-stone)]"
    : preview
      ? "bg-gradient-to-b from-black/44 via-black/52 to-[var(--color-stone)]"
      : "bg-gradient-to-b from-black/16 via-black/22 to-[var(--color-stone)]";
  const isImagePreview = media === "image" || hasCustomImage;
  const titleClass = isImagePreview
    ? "mt-6 font-display text-4xl font-semibold drop-shadow-md sm:text-5xl lg:text-5xl"
    : "mt-6 font-display text-4xl font-semibold drop-shadow-md sm:text-5xl lg:text-6xl";
  // On a colourful custom photo, white buttons have maximum contrast regardless of background colours
  const primaryVariant = hasCustomImage ? "light" : isImagePreview ? "primary" : "light";
  const secondaryVariant = hasCustomImage ? "ghostLight" : "light";

  if (hasCustomImage) {
    return (
      <section className="relative -mt-20 min-h-[620px] overflow-hidden bg-[var(--color-forest)] sm:min-h-[700px] lg:min-h-[760px]">
        <div
          className="absolute inset-0 bg-cover bg-[position:28%_center] sm:bg-[position:35%_center] lg:bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/42 via-black/18 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/46 via-black/12 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black/22 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-7xl flex-col px-4 pb-16 pt-32 text-white sm:min-h-[700px] sm:px-6 sm:pb-20 sm:pt-36 lg:min-h-[760px] lg:pb-24">
          <div className="flex flex-1 items-center justify-center pt-8 sm:pt-12">
            <div className="flex w-full max-w-4xl flex-col items-center justify-between gap-5 sm:flex-row sm:gap-10">
              <Button
                href={hero.primaryCta.href}
                variant="ghostLight"
                size="lg"
                disabled={preview}
                className="px-8 text-lg tracking-[0.08em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.82)]"
              >
                {hero.primaryCta.label}
              </Button>
              <Button
                href={hero.secondaryCta.href}
                variant="ghostLight"
                size="lg"
                disabled={preview}
                className="px-8 text-lg tracking-[0.08em] text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.82)]"
              >
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-7xl text-center">
            <h1 className="font-display text-[1.8rem] font-semibold leading-[1.04] tracking-[0.025em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.84)] sm:text-[3.05rem] sm:tracking-[0.08em] lg:text-[3.65rem]">
              {hero.title}
            </h1>
            {hero.description && (
              <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 drop-shadow-[0_3px_12px_rgba(0,0,0,0.75)] sm:text-lg">
                {hero.description}
              </p>
            )}
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
          : "-mt-20 pt-28 pb-44 sm:pb-52 lg:pb-60"
      }`}
    >
      <div className="absolute inset-0 -z-10">
        {media === "image" || heroImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
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
        {!hideBadge && (nextSession ? (
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
        ))}
        <h1 className={titleClass}>
          {hero.title}
        </h1>
        {hero.description && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 drop-shadow-md sm:text-lg">
            {hero.description}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            href={hero.primaryCta.href}
            variant={primaryVariant}
            size="lg"
            disabled={preview}
          >
            {hero.primaryCta.label}
          </Button>
          <Button href={hero.secondaryCta.href} variant={secondaryVariant} size="lg" disabled={preview}>
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
