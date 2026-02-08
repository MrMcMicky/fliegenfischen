import { SectionHeader } from "@/components/SectionHeader";
import { LegalContent } from "@/components/LegalContent";
import { prisma } from "@/lib/db";
import { buildLegalContent } from "@/lib/legal";

export const metadata = {
  title: "Rechtliches",
  description: "Datenschutz, AGB und Impressum der Fliegenfischerschule.",
};

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
