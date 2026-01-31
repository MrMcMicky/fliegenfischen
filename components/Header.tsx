"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/Button";

export function Header({
  siteName,
  location,
  navLinks,
}: {
  siteName: string;
  location: string;
  navLinks: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/70 bg-[var(--color-stone)]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex flex-col">
          <span className="font-display text-lg font-semibold text-[var(--color-text)]">
            {siteName}
          </span>
          <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-forest)]/60">
            {location}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--color-text)] lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--color-forest)]/70"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <Button href="/gutscheine" size="sm">
              Gutschein
            </Button>
          </div>
          <button
            type="button"
            aria-label={open ? "Menue schliessen" : "Menue oeffnen"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 p-2 text-[var(--color-text)] transition hover:bg-white lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-stone)] lg:hidden">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[var(--color-text)]"
              >
                {item.label}
              </Link>
            ))}
            <Button href="/gutscheine" size="sm" className="w-fit">
              Gutschein
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
