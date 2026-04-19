import type { Metadata } from "next";

import { HomeContent } from "@/app/page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Frontpage Preview",
    description: "Alternative Frontpage-Vorschau der Fliegenfischerschule.",
    path: "/test",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function TestHome({
  searchParams,
}: {
  searchParams?: { w?: string } | URLSearchParams | Promise<unknown>;
}) {
  return (
    <HomeContent
      searchParams={searchParams}
      heroMedia="image"
      heroImage="/videos/hero-urs.jpg"
      hideSessionBadge
      heroOverride={{
        title: "Herzlich willkommen in der Fliegenfischerschule Urs Müller",
        primaryCta: { label: "Kursangebot entdecken", href: "/#kurse" },
        secondaryCta: { label: "Privatlektion anfragen", href: "/#privat" },
      }}
    />
  );
}
