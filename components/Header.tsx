"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const manualActiveRef = useRef<{ hash: string; until: number } | null>(null);

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
      ? "rounded-full px-3 py-1.5 text-[var(--color-forest)] font-semibold transition-colors hover:bg-[var(--color-forest)]/10"
      : "rounded-full px-3 py-1.5 text-white/85 font-semibold transition-colors hover:bg-black/35 hover:text-white"
    : "rounded-full px-3 py-1.5 text-[var(--color-forest)] font-semibold transition-colors hover:bg-[var(--color-forest)]/10";
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

    const updateActive = () => {
      const offset = 240;
      const now = Date.now();
      const manual = manualActiveRef.current;
      if (manual && now < manual.until && window.location.hash === manual.hash) {
        setActiveSection(manual.hash);
        return;
      }
      if (manual && now >= manual.until) {
        manualActiveRef.current = null;
      }
      const scrollPos = window.scrollY + offset;
      let current: string | null = null;
      elements.forEach((el) => {
        if (el.offsetTop <= scrollPos) {
          current = `#${el.id}`;
        }
      });
      setActiveSection(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [isHome, sections]);

  const getHash = (href: string) => {
    const index = href.indexOf("#");
    return index === -1 ? null : href.slice(index);
  };

  const isActive = (href: string) => {
    const hash = getHash(href);
    if (hash) {
      return hash === activeSection;
    }
    return pathname === href;
  };

  const handleNavClick = (href: string) => {
    const hash = getHash(href);
    if (!hash) return;
    setActiveSection(hash);
    manualActiveRef.current = {
      hash,
      until: Date.now() + 900,
    };
  };

  const logoWrapClass = "rounded-lg bg-transparent";
  const showHeroLogo = isHome && !scrolled;
  const logoSrc = showHeroLogo
    ? "/branding/logo-hero.png"
    : scrolled
      ? "/branding/logo-mark.png"
      : "/branding/logo-dark.png";
  const logoWidth = showHeroLogo ? 260 : scrolled ? 110 : 260;
  const logoHeight = showHeroLogo ? 66 : scrolled ? 36 : 66;
  const logoClass = showHeroLogo
    ? "h-12 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] sm:h-14"
    : scrolled
      ? "h-8 w-auto"
      : "h-12 w-auto";

  const activeNavClass =
    "bg-[var(--color-forest)] text-white shadow-sm pointer-events-none";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${headerClass}`}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="sr-only">{siteName}</span>
          <div className={logoWrapClass}>
            <Image
              src={logoSrc}
              alt="Fliegenfischerschule Urs Müller"
              width={logoWidth}
              height={logoHeight}
              className={logoClass}
              priority
            />
          </div>
        </Link>
        <nav className="hidden items-center gap-2 text-sm lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
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
                onClick={() => {
                  handleNavClick(item.href);
                  setOpen(false);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  isActive(item.href)
                    ? "bg-[var(--color-forest)] text-white"
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
