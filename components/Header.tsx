"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
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
  const navPillClass = isHome
    ? scrolled
      ? "rounded-full bg-[var(--color-forest)]/10 px-3 py-1.5 text-[var(--color-forest)] font-semibold hover:bg-[var(--color-forest)]/15"
      : "rounded-full bg-black/35 px-3 py-1.5 text-white/95 font-semibold backdrop-blur-sm hover:bg-black/45"
    : "rounded-full bg-[var(--color-forest)]/10 px-3 py-1.5 text-[var(--color-forest)] font-semibold hover:bg-[var(--color-forest)]/15";
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

  const sections = useMemo(() => {
    const hashes = navLinks
      .map((item) => {
        const index = item.href.indexOf("#");
        if (index === -1) return null;
        return item.href.slice(index + 1);
      })
      .filter(Boolean) as string[];
    return Array.from(new Set(hashes));
  }, [navLinks]);

  useEffect(() => {
    if (!isHome || sections.length === 0) return;

    const elements = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome, sections]);

  const getHash = (href: string) => {
    const index = href.indexOf("#");
    return index === -1 ? null : href.slice(index);
  };

  const isActive = (href: string) => {
    const hash = getHash(href);
    if (hash && activeSection) return hash === activeSection;
    return pathname === href;
  };

  const activeNavClass = isHome
    ? scrolled
      ? "ring-1 ring-[var(--color-ember)]/40 bg-[var(--color-ember)]/10 text-[var(--color-forest)]"
      : "ring-1 ring-white/40 bg-black/55 text-white"
    : "ring-1 ring-[var(--color-ember)]/40 bg-[var(--color-ember)]/10 text-[var(--color-forest)]";

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
        <nav className="hidden items-center gap-2 text-sm lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${navPillClass} ${
                isActive(item.href) ? activeNavClass : ""
              }`}
              aria-current={isActive(item.href) ? "page" : undefined}
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
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  isActive(item.href)
                    ? "bg-[var(--color-ember)]/15 text-[var(--color-ember)]"
                    : "bg-[var(--color-forest)]/10 text-[var(--color-forest)]"
                }`}
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
