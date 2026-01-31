"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 48);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClass = scrolled
    ? "bg-white/90 backdrop-blur-md border-b border-[var(--color-border)] text-[var(--color-text)]"
    : "bg-transparent text-white";
  const navLinkClass = scrolled
    ? "text-[var(--color-text)] hover:text-[var(--color-forest)]/70"
    : "text-white/85 hover:text-white";
  const sublineClass = scrolled
    ? "text-[var(--color-forest)]/60"
    : "text-white/70";
  const menuButtonClass = scrolled
    ? "border-[var(--color-border)] bg-white/90 text-[var(--color-text)]"
    : "border-white/30 bg-white/10 text-white";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${headerClass}`}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex flex-col">
          <span className="font-display text-lg font-semibold">{siteName}</span>
          <span className={`text-[11px] uppercase tracking-[0.28em] ${sublineClass}`}>
            {location}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${navLinkClass}`}
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
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className={`inline-flex items-center justify-center rounded-full border p-2 transition hover:bg-white/20 lg:hidden ${menuButtonClass}`}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--color-border)] bg-white/95 backdrop-blur-md lg:hidden">
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
