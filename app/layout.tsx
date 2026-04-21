import type { Metadata } from "next";
import { Cormorant_Garamond, Playfair_Display, Source_Sans_3 } from "next/font/google";
import { headers } from "next/headers";

import "./globals.css";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StructuredData } from "@/components/seo/StructuredData";
import { prisma } from "@/lib/db";
import { env, isProd } from "@/lib/env";
import {
  buildLocalBusinessStructuredData,
  buildOrganizationStructuredData,
  buildWebSiteStructuredData,
  defaultOgImage,
  defaultSeoDescription,
  metadataBase,
  siteName,
  toAbsoluteUrl,
} from "@/lib/seo";

type NavLink = { label: string; href: string };

const headerVoucherLink: NavLink = {
  label: "Gutschein",
  href: "/#gutscheine",
};

const selfAssessmentLink: NavLink = {
  label: "Wurfstand",
  href: "/#standortbestimmung",
};

const buildHeaderNavLinks = (links: NavLink[], includeSelfAssessment: boolean) => {
  const filteredLinks = links.filter((item) => {
    const label = item.label.trim().toLowerCase();
    const href = item.href.trim().toLowerCase();
    return !(
      label === "gutschein" ||
      label === "wurfstand" ||
      href === "/gutscheine" ||
      href === "/#gutscheine" ||
      href === "#gutscheine" ||
      href === "/#standortbestimmung" ||
      href === "#standortbestimmung"
    );
  });

  return [
    headerVoucherLink,
    ...(includeSelfAssessment ? [selfAssessmentLink] : []),
    ...filteredLinks,
  ];
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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-hero",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultSeoDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteName,
    description: defaultSeoDescription,
    url: env.appUrl,
    siteName,
    locale: "de_CH",
    type: "website",
    images: [
      {
        url: toAbsoluteUrl(defaultOgImage),
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultSeoDescription,
    images: [toAbsoluteUrl(defaultOgImage)],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const isAdmin = requestHeaders.get("x-admin-section") === "1";
  const host = requestHeaders.get("host")?.toLowerCase() ?? "";
  const isTestHost = host === "test.fliegenfischer-schule.shop";
  const isClassicHost = !isTestHost;

  if (isAdmin) {
    return (
      <html lang="de">
        <body className={`${sourceSans.variable} ${playfair.variable} ${cormorant.variable} antialiased`}>
          <div className="min-h-screen bg-[var(--color-stone)]">{children}</div>
        </body>
      </html>
    );
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const navLinks = (settings?.navLinks as NavLink[]) || [];
  const headerNavLinks = buildHeaderNavLinks(navLinks, isClassicHost);
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
  const structuredData = [
    buildWebSiteStructuredData({
      name: settings?.name || siteName,
    }),
    buildOrganizationStructuredData({
      name: settings?.name || siteName,
    }),
    buildLocalBusinessStructuredData({
      name: settings?.name || siteName,
      location: settings?.location || "",
      contact,
    }),
  ];

  const themeClass = isClassicHost ? "theme-classic" : "";

  return (
    <html lang="de">
      <body className={`${sourceSans.variable} ${playfair.variable} ${cormorant.variable} antialiased`}>
        <div className={`flex min-h-screen flex-col ${themeClass}`}>
          <StructuredData data={structuredData} />
          {isProd ? <AnalyticsTracker /> : null}
          <Header
            siteName={settings?.name || "Fliegenfischerschule"}
            navLinks={headerNavLinks}
            previewMode={isClassicHost}
            classicLogo={isClassicHost}
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
