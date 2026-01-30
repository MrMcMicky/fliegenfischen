import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const fraunces = Fraunces({
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${manrope.variable} ${fraunces.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
