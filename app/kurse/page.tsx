import type { Metadata } from "next";

import { CourseCard } from "@/components/CourseCard";
import { StructuredData } from "@/components/seo/StructuredData";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";
import {
  buildBreadcrumbStructuredData,
  buildPageMetadata,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Kurse",
  description:
    "Kursübersicht für Einhand und Zweihand. Kleine Gruppen, klare Lernziele, feste Termine.",
  path: "/kurse",
});

export const dynamic = "force-dynamic";

export default async function KursePage() {
  const [courses, sessions] = await Promise.all([
    prisma.course.findMany({ orderBy: { title: "asc" } }),
    prisma.courseSession.findMany({ orderBy: { date: "asc" } }),
  ]);

  const sessionsByCourse = sessions.reduce<Record<string, typeof sessions>>(
    (acc, session) => {
      acc[session.courseId] = acc[session.courseId] || [];
      acc[session.courseId].push(session);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: "Startseite", path: "/" },
          { name: "Kurse", path: "/kurse" },
        ])}
      />
      <SectionHeader
        eyebrow="Kurse"
        title="Kursübersicht"
        description="Einhand, Zweihand und fortgeschrittene Technik. Wir arbeiten in kleinen Gruppen und mit klarer Zielsetzung."
      />
      <div className="grid gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            sessions={sessionsByCourse[course.id] || []}
          />
        ))}
      </div>
    </div>
  );
}
