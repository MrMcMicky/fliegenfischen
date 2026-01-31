import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { aboutPage } from "@/lib/data";

export const metadata = {
  title: "Über uns",
  description: "Über die Fliegenfischerschule, Philosophie und Instruktor.",
};

export default function UeberUnsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Über uns"
        title={aboutPage.title}
        description={aboutPage.intro}
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
          <p>{aboutPage.bio}</p>
          <ul className="space-y-2">
            {aboutPage.values.map((value) => (
              <li key={value}>• {value}</li>
            ))}
          </ul>
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
