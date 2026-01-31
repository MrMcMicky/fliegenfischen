import type { MetadataRoute } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { prisma } from "@/lib/db";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const isBuild = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
  const staticRoutes = [
    "",
    "/kurse",
    "/kurse/termine",
    "/privatunterricht",
    "/schnupperstunden",
    "/gutscheine",
    "/ueber-uns",
    "/berichte",
    "/kontakt",
    "/rechtliches",
    "/wetter",
  ];

  if (isBuild) {
    return staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    }));
  }

  let courses: { slug: string }[] = [];
  let reports: { slug: string }[] = [];
  try {
    [courses, reports] = await Promise.all([
      prisma.course.findMany({ select: { slug: true } }),
      prisma.report.findMany({ select: { slug: true } }),
    ]);
  } catch {
    // Fallback to static routes if DB is unavailable.
  }

  const courseRoutes = courses.map((course) => `/kurse/${course.slug}`);
  const reportRoutes = reports.map((report) => `/berichte/${report.slug}`);

  return [...staticRoutes, ...courseRoutes, ...reportRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
