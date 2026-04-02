import type { Metadata } from "next";

import { SectionHeader } from "@/components/SectionHeader";
import { LegalContent } from "@/components/LegalContent";
import { StructuredData } from "@/components/seo/StructuredData";
import { prisma } from "@/lib/db";
import { buildLegalContent } from "@/lib/legal";
import {
  buildBreadcrumbStructuredData,
  buildPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Rechtliches",
  description: "Datenschutz, AGB und Impressum der Fliegenfischerschule.",
  path: "/rechtliches",
});

export const dynamic = "force-dynamic";

export default async function RechtlichesPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
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
  const siteName = settings?.name || "Fliegenfischerschule";
  const legalContent = buildLegalContent({ siteName, contact });

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 pb-20 pt-16">
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: "Startseite", path: "/" },
          { name: "Rechtliches", path: "/rechtliches" },
        ])}
      />
      <SectionHeader
        eyebrow="Rechtliches"
        title="Datenschutz, Impressum & Hinweise"
        description="Kurze, transparente Zusammenfassung der wichtigsten rechtlichen Informationen."
      />
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-8">
        <LegalContent content={legalContent} />
      </div>
    </div>
  );
}
