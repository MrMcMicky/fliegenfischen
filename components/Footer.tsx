import Link from "next/link";

import { footerLinks, navLinks } from "@/lib/data";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-[var(--color-forest)] text-white">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="space-y-4">
          <div>
            <p className="font-display text-2xl font-semibold">
              {siteConfig.name}
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              {siteConfig.location}
            </p>
          </div>
          <p className="text-sm text-white/70">
            Fliegenfischen lernen mit Ruhe, Technik und Blick für Details.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Navigation
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Angebote
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {footerLinks.offer.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Ressourcen
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {footerLinks.resources.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-white/80">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Kontakt
          </p>
          <div className="mt-4 space-y-1">
            <p className="font-semibold text-white">{siteConfig.contact.instructor}</p>
            <p>{siteConfig.contact.address[0]}</p>
            <p>{siteConfig.contact.address[1]}</p>
          </div>
          <div className="mt-4 space-y-1">
            <p>Tel. {siteConfig.contact.phone}</p>
            <p>Natel {siteConfig.contact.mobile}</p>
            <p>{siteConfig.contact.email}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
