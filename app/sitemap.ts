import type { MetadataRoute } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { prisma } from "@/lib/db";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isBuild = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
  const now = new Date();
  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/kurse", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/kurse/termine", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/privatunterricht", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/schnupperstunden", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/gutscheine", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/berichte", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/kontakt", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/rechtliches", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/wetter", priority: 0.4, changeFrequency: "daily" as const },
  ];

  if (isBuild) {
    return staticRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }));
  }

  let courses: { slug: string; updatedAt: Date }[] = [];
  let reports: { slug: string; updatedAt: Date }[] = [];
  let settingsUpdatedAt = now;
  try {
    const [coursesResult, reportsResult, settings] = await Promise.all([
      prisma.course.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.report.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.siteSettings.findUnique({
        where: { id: 1 },
        select: { updatedAt: true },
      }),
    ]);
    courses = coursesResult;
    reports = reportsResult;
    settingsUpdatedAt = settings?.updatedAt || now;
  } catch {
    // Fallback to static routes if DB is unavailable.
  }

  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: settingsUpdatedAt,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
  const courseEntries = courses.map((course) => ({
    url: `${siteUrl}/kurse/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const reportEntries = reports.map((report) => ({
    url: `${siteUrl}/berichte/${report.slug}`,
    lastModified: report.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...courseEntries, ...reportEntries];
}
