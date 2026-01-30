import Link from "next/link";
import type { ReactNode } from "react";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold tracking-wide transition-all duration-300";

const variants = {
  primary:
    "bg-[var(--color-ember)] text-white shadow-[0_12px_30px_rgba(232,134,72,0.35)] hover:translate-y-[-1px] hover:shadow-[0_16px_40px_rgba(232,134,72,0.4)]",
  secondary:
    "border border-[var(--color-forest)]/20 text-[var(--color-forest)] hover:border-[var(--color-forest)]/40 hover:bg-[var(--color-forest)]/5",
  ghost:
    "text-[var(--color-forest)] hover:text-[var(--color-forest)]/80",
};

const sizes = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonProps) {
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
}
