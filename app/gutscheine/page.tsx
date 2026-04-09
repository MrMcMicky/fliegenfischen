import type { Metadata } from "next";

import { SectionHeader } from "@/components/SectionHeader";
import { StructuredData } from "@/components/seo/StructuredData";
import { VoucherShowcase } from "@/components/VoucherShowcase";
import { prisma } from "@/lib/db";
import {
  buildBreadcrumbStructuredData,
  buildPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Gutscheine",
  description: "Wert- und Kursgutscheine für Fliegenfischerkurse.",
  path: "/gutscheine",
});

export const dynamic = "force-dynamic";

export default async function GutscheinePage() {
  const voucherOptions = await prisma.voucherOption.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-12 px-4 pb-20 pt-16">
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: "Startseite", path: "/" },
          { name: "Gutscheine", path: "/gutscheine" },
        ])}
      />
      <SectionHeader
        eyebrow="Gutscheine"
        title="Geschenk mit Erlebnis"
        description="Wir erstellen den Gutschein als PDF mit persönlicher Widmung. Versand per Mail oder auf Wunsch gedruckt."
        descriptionClassName="max-w-none lg:whitespace-nowrap"
      />
      <VoucherShowcase voucherOptions={voucherOptions} />
    </div>
  );
}
