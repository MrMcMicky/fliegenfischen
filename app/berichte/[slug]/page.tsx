import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/Button";
import { StructuredData } from "@/components/seo/StructuredData";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";
import {
  buildBreadcrumbStructuredData,
  buildPageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const extractFirstImage = (body: string) => {
  const match = body.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] || null;
};

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> => {
  let resolvedSlug: string | undefined;
  try {
    const { slug } = await Promise.resolve(params);
    resolvedSlug = slug;
    if (!resolvedSlug) {
      return buildPageMetadata({ title: "Bericht", path: "/berichte" });
    }
    const report = await prisma.report.findUnique({
      where: { slug: resolvedSlug },
    });
    if (!report) {
      return buildPageMetadata({ title: "Bericht", path: "/berichte" });
    }
    return buildPageMetadata({
      title: report.title,
      description: report.summary,
      path: `/berichte/${report.slug}`,
      image: report.coverImage || extractFirstImage(report.body) || undefined,
      type: "article",
    });
  } catch (error) {
    console.error("Report metadata error", {
      slug: resolvedSlug,
      error,
    });
    return buildPageMetadata({ title: "Bericht", path: "/berichte" });
  }
};

export default async function BerichtDetailPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await Promise.resolve(params);
  if (!slug) {
    notFound();
  }

  const report = await prisma.report.findUnique({
    where: { slug },
  });

  if (!report) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-10 px-4 pb-20 pt-16">
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: "Startseite", path: "/" },
          { name: "Berichte", path: "/berichte" },
          { name: report.title, path: `/berichte/${report.slug}` },
        ])}
      />
      <SectionHeader
        eyebrow={`${report.location} · ${report.year}`}
        title={report.title}
        description={report.summary}
      />
      <div className="space-y-8 rounded-xl border border-[var(--color-border)] bg-white p-8 text-sm text-[var(--color-muted)]">
        <div
          className="report-content"
          dangerouslySetInnerHTML={{ __html: report.body }}
        />
        {report.highlights.length > 0 ? (
          <ul className="space-y-2">
            {report.highlights.map((highlight) => (
              <li key={highlight}>• {highlight}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-4">
        <Button href="/berichte" variant="secondary">
          Zurück zu allen Berichten
        </Button>
        <Button href="/kurse">Zu den Kursen</Button>
      </div>
    </div>
  );
}
