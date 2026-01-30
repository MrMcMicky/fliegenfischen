import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[var(--color-mist)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-forest)] ${className}`}
    >
      {children}
    </span>
  );
}
