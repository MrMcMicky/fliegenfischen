import Link from "next/link";
import type { ReactNode } from "react";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold tracking-wide transition-all duration-300";

const variants = {
  primary:
    "bg-[var(--color-ember)] text-white shadow-[0_16px_40px_rgba(242,125,66,0.35)] hover:translate-y-[-1px] hover:shadow-[0_20px_50px_rgba(242,125,66,0.4)]",
  secondary:
    "bg-white/80 text-[var(--color-forest)] ring-1 ring-[var(--color-forest)]/20 hover:bg-white",
  ghost:
    "text-[var(--color-forest)] hover:bg-[var(--color-forest)]/10",
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
