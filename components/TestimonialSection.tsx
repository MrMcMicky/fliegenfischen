import type { ReactNode } from "react";

export function TestimonialSection({
  section,
  testimonials,
}: {
  section: { eyebrow: ReactNode; title: ReactNode; description: ReactNode };
  testimonials: { quote: ReactNode; author: ReactNode }[];
}) {
  return (
    <section className="bg-[var(--color-forest)] py-16 text-white">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            {section.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold">
            {section.title}
          </h2>
          <p className="mt-4 text-sm text-white/70">{section.description}</p>
        </div>
        <div className="space-y-4">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-sm">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/60">
                {item.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
