import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-river)]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl font-semibold text-[var(--color-forest)] sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base text-[var(--color-forest)]/70 sm:text-lg">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
