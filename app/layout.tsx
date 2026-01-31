import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";

import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { prisma } from "@/lib/db";

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
    default: "Fliegenfischerschule Urs Mueller",
    template: "%s | Fliegenfischerschule Urs Mueller",
  },
  description:
    "Fliegenfischen lernen in der Region Zuerich: Einhand- und Zweihandkurse, Privatunterricht, Schnupperstunden und Gutscheine.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const navLinks = (settings?.navLinks as { label: string; href: string }[]) || [];
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
            location={settings?.location || ""}
            navLinks={navLinks}
          />
          <main className="flex-1">{children}</main>
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
