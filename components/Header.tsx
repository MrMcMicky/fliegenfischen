"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const getHash = (href: string) => {
  const index = href.indexOf("#");
  return index === -1 ? null : href.slice(index);
};

export function Header({
  siteName,
  navLinks,
  previewMode = false,
  classicLogo = false,
}: {
  siteName: string;
  navLinks: { label: string; href: string }[];
  previewMode?: boolean;
  classicLogo?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const isPreviewRoute = pathname === "/test";
  const isPreviewMode = previewMode || isPreviewRoute;
  const isHome = pathname === "/" || isPreviewRoute;
  const showBreadcrumb = !isHome && !pathname.startsWith("/buchen");
  const manualActiveRef = useRef<{ hash: string; until: number } | null>(null);
  const displayedNavLinks = useMemo(() => {
    if (!isPreviewMode) return navLinks;
    const voucherLinks = navLinks.filter((item) => getHash(item.href) === "#gutscheine");
    const regularLinks = navLinks.filter((item) => getHash(item.href) !== "#gutscheine");
    return [...regularLinks, ...voucherLinks];
  }, [isPreviewMode, navLinks]);

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
    const hashes = displayedNavLinks
      .map((item) => {
        const index = item.href.indexOf("#");
        if (index === -1) return null;
        return item.href.slice(index + 1);
      })
      .filter(Boolean) as string[];
    return Array.from(new Set(hashes));
  }, [displayedNavLinks]);

  const routeHighlight = useMemo(() => {
    if (isHome) return null;
    if (pathname.startsWith("/gutscheine")) return "#gutscheine";
    if (pathname.startsWith("/berichte")) return "#links";
    if (pathname.startsWith("/kontakt")) return "#kontakt";
    if (pathname.startsWith("/wetter")) return "#wetter";
    if (pathname.startsWith("/kurse") || pathname.startsWith("/buchen")) return "#kurse";
    if (pathname.startsWith("/privatunterricht") || pathname.startsWith("/schnupperstunden")) {
      return "#privat";
    }
    return null;
  }, [isHome, pathname]);

  const breadcrumbItems = useMemo(() => {
    if (isHome) return null;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return null;
    const humanize = (slug: string) =>
      slug
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    const items: { label: string; href?: string }[] = [
      { label: "Startseite", href: "/" },
    ];
    if (routeHighlight) {
      const navItem = navLinks.find(
        (item) => getHash(item.href) === routeHighlight
      );
      if (navItem) {
        items.push({ label: navItem.label, href: navItem.href });
      }
    }
    const [root, slug] = segments;
    let currentLabel: string | null = null;
    if (root === "berichte" && slug) {
      currentLabel = `Bericht: ${humanize(slug)}`;
    } else if (root === "kurse" && slug) {
      currentLabel = `Kurs: ${humanize(slug)}`;
    } else if (root === "buchen") {
      currentLabel = "Buchung";
    } else if (root === "gutscheine") {
      currentLabel = "Gutschein";
    }
    if (currentLabel) {
      items.push({ label: currentLabel });
    }
    return items;
  }, [isHome, navLinks, pathname, routeHighlight]);

  useEffect(() => {
    if (!isHome || sections.length === 0) return;

    const elements = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .sort((a, b) => (a as HTMLElement).offsetTop - (b as HTMLElement).offsetTop) as HTMLElement[];
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

  const isActive = (href: string) => {
    const hash = getHash(href);
    if (hash) {
      if (!isHome) {
        return routeHighlight === hash;
      }
      return hash === activeSection;
    }
    return pathname === href;
  };

  const handleNavClick = (href: string, eventTime: number) => {
    const hash = getHash(href);
    if (!hash) return;
    setActiveSection(hash);
    manualActiveRef.current = {
      hash,
      until: eventTime + 1200,
    };
  };
  const localizeHomeAnchor = (href: string) => {
    if (!isPreviewRoute || !href.startsWith("/#")) return href;
    const hash = getHash(href);
    return hash ? `/test${hash}` : href;
  };

  const showHeroLogo = isHome && !scrolled;
  const logoWrapClass = "rounded-lg bg-transparent";

  let logoSrc: string;
  let logoWidth: number;
  let logoHeight: number;
  let logoClass: string;

  if (classicLogo) {
    // Dark background states: hero overlay → neon dark logo
    // Light background states: scrolled/non-home → classic light logo
    logoSrc = showHeroLogo
      ? "/branding/logo-classic-dark.png"
      : scrolled
        ? "/branding/logo-classic-mark.png"
        : "/branding/logo-classic.png";
    logoWidth = showHeroLogo ? 600 : scrolled ? 160 : 400;
    logoHeight = showHeroLogo ? 200 : scrolled ? 64 : 130;
    logoClass = showHeroLogo
      ? "h-36 w-auto drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)] sm:h-40"
      : scrolled
        ? "h-11 w-auto"
        : "h-16 w-auto";
  } else {
    logoSrc = showHeroLogo
      ? "/branding/logo-hero.png"
      : scrolled
        ? "/branding/logo-mark.png"
        : "/branding/logo-dark.png";
    logoWidth = showHeroLogo ? 260 : scrolled ? 110 : 260;
    logoHeight = showHeroLogo ? 66 : scrolled ? 36 : 66;
    logoClass = showHeroLogo
      ? "h-12 w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] sm:h-14"
      : scrolled
        ? "h-8 w-auto"
        : "h-12 w-auto";
  }

  const activeNavClass =
    isHome && !scrolled
      ? "text-white pointer-events-none"
      : "bg-[var(--color-forest)] text-white font-bold pointer-events-none";
  const voucherNavClass =
    "rounded-full bg-[var(--color-ember)] px-5 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(var(--color-ember-rgb),0.4)] transition hover:bg-[var(--color-ember)]/90 hover:text-white hover:shadow-[0_6px_20px_rgba(var(--color-ember-rgb),0.5)]";
  const voucherMobileClass =
    "bg-[var(--color-ember)] text-white hover:bg-[var(--color-ember)]/90";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${headerClass}`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link
          href={isPreviewRoute ? "/test" : "/"}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-3"
        >
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
        <nav className="hidden items-center gap-3 text-sm lg:flex">
          {displayedNavLinks.map((item) => {
            const href = localizeHomeAnchor(item.href);
            return (
              <Link
                key={item.href}
                href={href}
                onClick={(event) => handleNavClick(href, event.timeStamp)}
                className={`whitespace-nowrap transition-colors ${
                  getHash(item.href) === "#gutscheine"
                    ? `${voucherNavClass}${isActive(item.href) ? " ring-2 ring-offset-2 ring-[var(--color-ember)] pointer-events-none" : ""}`
                    : `${navPillClass}${isActive(item.href) ? ` ${activeNavClass}` : ""}`
                }`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
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
            {displayedNavLinks.map((item) => {
              const href = localizeHomeAnchor(item.href);
              return (
                <Link
                  key={item.href}
                  href={href}
                  onClick={(event) => {
                    handleNavClick(href, event.timeStamp);
                    setOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive(item.href)
                      ? "bg-[var(--color-forest)] text-white"
                      : getHash(item.href) === "#gutscheine"
                      ? voucherMobileClass
                      : "bg-[var(--color-forest)]/10 text-[var(--color-forest)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
      {!isHome && showBreadcrumb && breadcrumbItems?.length ? (
        <div className="border-t border-[var(--color-border)] bg-white/90">
          <nav
            className="mx-auto w-full max-w-5xl px-4 py-2"
            aria-label="Breadcrumb"
          >
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]/60">
              {breadcrumbItems.map((item, index) => (
                <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="transition hover:text-[var(--color-forest)]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-[var(--color-text)]">{item.label}</span>
                  )}
                  {index < breadcrumbItems.length - 1 ? (
                    <span className="text-[var(--color-muted)]">/</span>
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
