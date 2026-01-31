import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";

import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${sourceSans.variable} ${playfair.variable} antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
