"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/Button";

export function Header({
  siteName,
  navLinks,
}: {
  siteName: string;
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

  const logoWrapClass = isHome && !scrolled
    ? "rounded-lg bg-transparent"
    : "rounded-lg bg-transparent";

  const activeNavClass = isHome
    ? scrolled
      ? "ring-1 ring-[var(--color-ember)]/45 bg-[var(--color-ember)]/20 text-[var(--color-forest)] shadow-sm"
      : "ring-1 ring-white/45 bg-white/20 text-white shadow-sm"
    : "ring-1 ring-[var(--color-ember)]/45 bg-[var(--color-ember)]/20 text-[var(--color-forest)] shadow-sm";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${headerClass}`}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="sr-only">{siteName}</span>
          <div className={logoWrapClass}>
            <Image
              src={
                scrolled ? "/branding/logo-mark.png" : "/branding/logo-hero.png"
              }
              alt="Fliegenfischerschule Urs Müller"
              width={scrolled ? 110 : 260}
              height={scrolled ? 36 : 66}
              className={
                scrolled
                  ? "h-8 w-auto"
                  : "h-12 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] sm:h-14"
              }
              priority
            />
          </div>
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
