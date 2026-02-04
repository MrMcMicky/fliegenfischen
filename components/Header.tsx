"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 48);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClass = isHome
    ? scrolled
      ? "bg-white/90 backdrop-blur-md border-b border-[var(--color-border)] text-[var(--color-text)]"
      : "bg-transparent text-white"
    : "bg-white/90 backdrop-blur-md border-b border-[var(--color-border)] text-[var(--color-text)]";
  const navLinkClass = isHome
    ? scrolled
      ? "text-[var(--color-forest)]/70 hover:text-[var(--color-forest)]"
      : "text-white/75 hover:text-white"
    : "text-[var(--color-forest)]/70 hover:text-[var(--color-forest)]";
  const primaryLinks = new Set(["/kurse", "/privatunterricht"]);
  const primaryNav = navLinks.filter((item) => primaryLinks.has(item.href));
  const secondaryNav = navLinks.filter((item) => !primaryLinks.has(item.href));
  const primaryNavClass = isHome
    ? scrolled
      ? "rounded-full bg-[var(--color-forest)]/10 px-3 py-1.5 text-[var(--color-forest)] font-semibold"
      : "rounded-full bg-black/35 px-3 py-1.5 text-white/95 font-semibold backdrop-blur-sm"
    : "rounded-full bg-[var(--color-forest)]/10 px-3 py-1.5 text-[var(--color-forest)] font-semibold";
  const dividerClass = isHome && !scrolled ? "bg-white/30" : "bg-[var(--color-border)]";
  const sublineClass = isHome
    ? scrolled
      ? "text-[var(--color-forest)]/60"
      : "text-white/70"
    : "text-[var(--color-forest)]/60";
  const menuButtonClass = isHome
    ? scrolled
      ? "border-[var(--color-border)] bg-white/90 text-[var(--color-text)]"
      : "border-white/30 bg-white/10 text-white"
    : "border-[var(--color-border)] bg-white/90 text-[var(--color-text)]";

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
        <nav className="hidden items-center gap-4 text-sm lg:flex">
          <div className="flex items-center gap-2">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className={primaryNavClass}>
                {item.label}
              </Link>
            ))}
          </div>
          {secondaryNav.length > 0 ? (
            <span className={`h-5 w-px ${dividerClass}`} />
          ) : null}
          <div className="flex items-center gap-4 text-[0.85rem] font-semibold">
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${navLinkClass}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
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
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[var(--color-forest)]/10 px-3 py-2 text-sm font-semibold text-[var(--color-forest)]"
              >
                {item.label}
              </Link>
            ))}
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-[var(--color-text)]/80"
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
