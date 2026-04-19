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
  const heroTitleText = typeof hero.title === "string" ? hero.title : null;
  const classicTitle =
    heroTitleText === "Herzlich willkommen in der Fliegenfischerschule Urs Müller"
      ? {
          eyebrow: "Herzlich willkommen in der",
          title: "Fliegenfischerschule Urs Müller",
        }
      : null;

  if (hasCustomImage) {
    return (
      <section className="relative -mt-20 min-h-[600px] overflow-hidden bg-[var(--color-forest)] sm:min-h-[660px] lg:min-h-[690px] xl:min-h-[740px]">
        <div
          className="absolute inset-0 scale-[1.01] bg-cover bg-[position:28%_center] sm:bg-[position:35%_center] lg:bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/62 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/64 via-black/28 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/18 via-black/6 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/16 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[600px] w-full max-w-7xl flex-col px-5 pb-10 pt-28 text-white sm:min-h-[660px] sm:px-8 sm:pb-12 sm:pt-32 lg:min-h-[690px] lg:pb-14 xl:min-h-[740px] xl:pb-16">
          <div className="flex flex-1 items-center justify-center pt-8 sm:pt-10">
            <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 sm:gap-8">
              <Button
                href={hero.primaryCta.href}
                variant="ghostLight"
                size="lg"
                disabled={preview}
                className="whitespace-nowrap border border-white/45 bg-black/16 px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-white/70 hover:bg-black/24"
              >
                {hero.primaryCta.label}
              </Button>
              <Button
                href={hero.secondaryCta.href}
                variant="ghostLight"
                size="lg"
                disabled={preview}
                className="whitespace-nowrap border border-white/45 bg-black/16 px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-[2px] hover:border-white/70 hover:bg-black/24"
              >
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-7xl text-center">
            {classicTitle ? (
              <>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.36em] text-white/82 drop-shadow-[0_3px_12px_rgba(0,0,0,0.8)] sm:text-base">
                  {classicTitle.eyebrow}
                </p>
                <h1
                  className="text-[2.85rem] font-semibold leading-[0.88] text-white drop-shadow-[0_7px_22px_rgba(0,0,0,0.86)] sm:text-[4.55rem] lg:text-[5.15rem] xl:text-[5.65rem]"
                  style={{ fontFamily: "var(--font-hero), serif" }}
                >
                  {classicTitle.title}
                </h1>
              </>
            ) : (
              <h1
                className="text-[2.7rem] font-semibold leading-[0.95] text-white drop-shadow-[0_7px_22px_rgba(0,0,0,0.86)] sm:text-[4.5rem] lg:text-[5.1rem] xl:text-[6rem]"
                style={{ fontFamily: "var(--font-hero), serif" }}
              >
                {hero.title}
              </h1>
            )}
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
