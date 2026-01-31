import type { MetadataRoute } from "next";

import { courses } from "@/lib/courses";
import { reports } from "@/lib/reports";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const courseRoutes = courses.map((course) => `/kurse/${course.slug}`);
  const reportRoutes = reports.map((report) => `/berichte/${report.slug}`);

  return [...staticRoutes, ...courseRoutes, ...reportRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
