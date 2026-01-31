import { notFound } from "next/navigation";

import { Button } from "@/components/Button";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const generateStaticParams = async () => {
  const reports = await prisma.report.findMany({ select: { slug: true } });
  return reports.map((report) => ({ slug: report.slug }));
};

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const report = await prisma.report.findUnique({
    where: { slug: params.slug },
  });
  if (!report) return { title: "Bericht" };
  return {
    title: report.title,
    description: report.summary,
  };
};

export default async function BerichtDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const report = await prisma.report.findUnique({
    where: { slug: params.slug },
  });

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
        <p>{report.body}</p>
        <ul className="space-y-2">
          {report.highlights.map((highlight) => (
            <li key={highlight}>• {highlight}</li>
          ))}
        </ul>
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
