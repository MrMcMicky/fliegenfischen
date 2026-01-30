import { notFound } from "next/navigation";

import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { getReportBySlug, reports } from "@/lib/reports";

export const generateStaticParams = async () =>
  reports.map((report) => ({ slug: report.slug }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const report = getReportBySlug(params.slug);
  if (!report) return { title: "Bericht" };
  return {
    title: report.title,
    description: report.summary,
  };
};

export default function BerichtDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const report = getReportBySlug(params.slug);

  if (!report) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow={`${report.location} · ${report.year}`}
        title={report.title}
        description={report.summary}
      />
      <div className="space-y-6 rounded-xl border border-[var(--color-border)] bg-white p-8 text-sm text-[var(--color-muted)]">
        <p>
          Dieser Bericht wird im Relaunch aus dem bestehenden Material neu
          aufbereitet. Ziel ist eine klare Struktur, groessere Bilder und eine
          bessere Lesbarkeit auf Mobilgeraeten.
        </p>
        <ul className="space-y-2">
          {report.highlights.map((highlight) => (
            <li key={highlight}>• {highlight}</li>
          ))}
        </ul>
        <p>
          Im naechsten Schritt integrieren wir die originalen Bilder, Karten und
          Routeninformationen aus dem bestehenden Archiv.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button href="/berichte" variant="secondary">
          Zurueck zu allen Berichten
        </Button>
        <Button href="/kurse">Zu den Kursen</Button>
      </div>
    </div>
  );
}
