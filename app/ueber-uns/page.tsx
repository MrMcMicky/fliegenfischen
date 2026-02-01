import Image from "next/image";

import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Über uns",
  description: "Über die Fliegenfischerschule, Philosophie und Instruktor.",
};

export const dynamic = "force-dynamic";

export default async function UeberUnsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const aboutPage = settings?.aboutPage as {
    title: string;
    intro: string;
    bio: string;
    highlights: string[];
    values: string[];
    cta: {
      title: string;
      description: string;
      primary: { label: string; href: string };
      secondary: { label: string; href: string };
    };
  };

  if (!aboutPage) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-16">
        <p className="text-sm text-[var(--color-muted)]">
          Inhalte werden vorbereitet.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Über uns"
        title={aboutPage.title}
        description={aboutPage.intro}
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-3">
            <Image
              src="/illustrations/urs-mueller.png"
              alt="Urs Müller am Wasser"
              width={1200}
              height={800}
              className="h-56 w-full rounded-lg object-cover sm:h-64"
            />
          </div>
          <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
            <p>{aboutPage.bio}</p>
            <ul className="space-y-2">
              {aboutPage.values.map((value) => (
                <li key={value}>• {value}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-2xl bg-[var(--color-forest)] p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Qualifikation
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {aboutPage.highlights.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid gap-8 rounded-2xl border border-[var(--color-border)] bg-white p-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="font-display text-3xl font-semibold text-[var(--color-text)]">
            {aboutPage.cta.title}
          </h2>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            {aboutPage.cta.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button href={aboutPage.cta.primary.href} size="lg">
            {aboutPage.cta.primary.label}
          </Button>
          <Button href={aboutPage.cta.secondary.href} variant="secondary" size="lg">
            {aboutPage.cta.secondary.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
