import Link from "next/link";

import { primaryNav, secondaryNav } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/60 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:justify-between">
        <div className="max-w-sm space-y-4">
          <div>
            <p className="font-display text-2xl font-semibold text-[var(--color-forest)]">
              {siteConfig.name}
            </p>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-river)]">
              {siteConfig.location}
            </p>
          </div>
          <p className="text-sm text-[var(--color-forest)]/70">
            Individuelle Kurse am Wasser, klare Technik, ehrliche Beratung.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-river)]">
              Navigation
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-forest)]">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[var(--color-river)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-river)]">
              Service
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--color-forest)]">
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-[var(--color-river)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-sm text-[var(--color-forest)]/70">
          <p className="font-semibold text-[var(--color-forest)]">Kontakt</p>
          <p>{siteConfig.contact.address[0]}</p>
          <p>{siteConfig.contact.address[1]}</p>
          <p className="mt-2">Tel. {siteConfig.contact.phone}</p>
          <p>Natel {siteConfig.contact.mobile}</p>
          <p>{siteConfig.contact.email}</p>
        </div>
      </div>
      <div className="border-t border-white/60 px-6 py-4 text-center text-xs text-[var(--color-forest)]/60">
        © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
