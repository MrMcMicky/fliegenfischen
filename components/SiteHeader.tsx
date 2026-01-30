import Link from "next/link";

import { Button } from "./Button";
import { primaryNav } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex flex-col">
          <span className="font-display text-xl font-semibold text-[var(--color-forest)]">
            {siteConfig.name}
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-river)]">
            {siteConfig.location}
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-[var(--color-forest)] lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--color-river)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button href="/kurse" variant="secondary" size="sm">
            Kurse ansehen
          </Button>
          <Button href="/gutscheine" size="sm">
            Gutschein kaufen
          </Button>
        </div>
      </div>
    </header>
  );
}
