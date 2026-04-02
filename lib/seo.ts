import type { Metadata } from "next";

import { env } from "@/lib/env";

export const siteName = "Fliegenfischerschule Urs Müller";
export const defaultSeoDescription =
  "Fliegenfischen lernen in der Region Zürich: Einhand- und Zweihandkurse, Privatunterricht, Schnupperstunden und Gutscheine.";
export const defaultOgImage = "/videos/hero-fliegenfischer.jpg";
export const siteUrl = env.appUrl.replace(/\/$/, "");
export const metadataBase = new URL(siteUrl);

const withLeadingSlash = (value: string) =>
  value.startsWith("/") ? value : `/${value}`;

export const toAbsoluteUrl = (path: string) =>
  new URL(path.startsWith("http") ? path : withLeadingSlash(path), metadataBase).toString();

export const buildPageTitle = (title?: string) => {
  if (!title || title === siteName) return siteName;
  return `${title} | ${siteName}`;
};

export const buildPageMetadata = ({
  title,
  description = defaultSeoDescription,
  path = "/",
  image = defaultOgImage,
  type = "website",
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata => {
  const fullTitle = buildPageTitle(title);

  return {
    title,
    description,
    alternates: {
      canonical: withLeadingSlash(path),
    },
    openGraph: {
      title: fullTitle,
      description,
      url: toAbsoluteUrl(path),
      siteName,
      locale: "de_CH",
      type,
      images: [
        {
          url: toAbsoluteUrl(image),
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [toAbsoluteUrl(image)],
    },
  };
};

const parsePostalLine = (value?: string) => {
  if (!value) {
    return { postalCode: undefined, locality: undefined };
  }

  const normalized = value.replace(/^CH\s*/i, "").trim();
  const match = normalized.match(/^(\d{4})\s+(.+)$/);
  if (!match) {
    return { postalCode: undefined, locality: normalized || undefined };
  }

  return {
    postalCode: match[1],
    locality: match[2],
  };
};

export const buildOrganizationStructuredData = ({
  name,
  url = siteUrl,
  logo = "/branding/logo-dark.png",
}: {
  name: string;
  url?: string;
  logo?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name,
  url,
  logo: toAbsoluteUrl(logo),
});

export const buildWebSiteStructuredData = ({
  name,
  url = siteUrl,
  description = defaultSeoDescription,
}: {
  name: string;
  url?: string;
  description?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name,
  url,
  description,
  inLanguage: "de-CH",
});

export const buildLocalBusinessStructuredData = ({
  name,
  location,
  contact,
  image = defaultOgImage,
}: {
  name: string;
  location?: string;
  contact: {
    instructor?: string;
    address?: string[];
    phone?: string;
    mobile?: string;
    email?: string;
  };
  image?: string;
}) => {
  const addressLines = contact.address ?? [];
  const { postalCode, locality } = parsePostalLine(addressLines[1]);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    image: toAbsoluteUrl(image),
    url: siteUrl,
    telephone: contact.mobile || contact.phone || undefined,
    email: contact.email || undefined,
    areaServed: location || "Region Zürich",
    address: {
      "@type": "PostalAddress",
      streetAddress: addressLines[0] || undefined,
      postalCode,
      addressLocality: locality,
      addressCountry: "CH",
    },
  };
};

export const buildBreadcrumbStructuredData = (
  items: { name: string; path: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.path),
  })),
});

export const buildFaqStructuredData = (
  items: { question?: string; answer?: string }[]
) => {
  const entries = items
    .map((item) => ({
      question: item.question?.trim(),
      answer: item.answer?.trim(),
    }))
    .filter((item) => item.question && item.answer);

  if (!entries.length) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
};
