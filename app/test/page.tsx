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
      heroOverride={{
        title: "Fliegenfischen in der Region Zürich – ruhig, präzise, draussen.",
        description:
          "Kleine Gruppen, klare Lernschritte und ein Instruktor mit SFV- und EFFA-Hintergrund.",
        primaryCta: { label: "Gruppenkurse entdecken", href: "/#kurse" },
        secondaryCta: { label: "Privatlektion buchen", href: "/#privat" },
      }}
    />
  );
}
