import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { headers } from "next/headers";

import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/db";

type NavLink = { label: string; href: string };

const headerVoucherLink: NavLink = {
  label: "Gutschein",
  href: "/#gutscheine",
};

const buildHeaderNavLinks = (links: NavLink[]) => {
  const filteredLinks = links.filter((item) => {
    const label = item.label.trim().toLowerCase();
    const href = item.href.trim().toLowerCase();
    return !(
      label === "gutschein" ||
      href === "/gutscheine" ||
      href === "/#gutscheine" ||
      href === "#gutscheine"
    );
  });

  return [headerVoucherLink, ...filteredLinks];
};

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Fliegenfischerschule Urs Müller",
    template: "%s | Fliegenfischerschule Urs Müller",
  },
  description:
    "Fliegenfischen lernen in der Region Zürich: Einhand- und Zweihandkurse, Privatunterricht, Schnupperstunden und Gutscheine.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const isAdmin = requestHeaders.get("x-admin-section") === "1";

  if (isAdmin) {
    return (
      <html lang="de">
        <body className={`${sourceSans.variable} ${playfair.variable} antialiased`}>
          <div className="min-h-screen bg-[var(--color-stone)]">{children}</div>
        </body>
      </html>
    );
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const navLinks = (settings?.navLinks as NavLink[]) || [];
  const headerNavLinks = buildHeaderNavLinks(navLinks);
  const footerLinks =
    (settings?.footerLinks as {
      offer: { label: string; href: string }[];
      resources: { label: string; href: string }[];
    }) || { offer: [], resources: [] };
  const contact =
    (settings?.contact as {
      instructor: string;
      address: string[];
      phone: string;
      mobile: string;
      email: string;
    }) || {
      instructor: "",
      address: ["", ""],
      phone: "",
      mobile: "",
      email: "",
    };

  return (
    <html lang="de">
      <body className={`${sourceSans.variable} ${playfair.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header
            siteName={settings?.name || "Fliegenfischerschule"}
            navLinks={headerNavLinks}
          />
          <main className="flex-1 pt-20">{children}</main>
          <Footer
            siteName={settings?.name || "Fliegenfischerschule"}
            location={settings?.location || ""}
            navLinks={navLinks}
            footerLinks={footerLinks}
            contact={contact}
          />
        </div>
      </body>
    </html>
  );
}
