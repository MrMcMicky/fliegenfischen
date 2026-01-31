import { CourseCard } from "@/components/CourseCard";
import { SectionHeader } from "@/components/SectionHeader";
import { courseSessions, courses } from "@/lib/courses";

export const metadata = {
  title: "Kurse",
  description:
    "Kursübersicht für Einhand und Zweihand. Kleine Gruppen, klare Lernziele, feste Termine.",
};

export default function KursePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-20 pt-16">
      <SectionHeader
        eyebrow="Kurse"
        title="Kursübersicht"
        description="Einhand, Zweihand und fortgeschrittene Technik. Wir arbeiten in kleinen Gruppen und mit klarer Zielsetzung."
      />
      <div className="grid gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.slug}
            course={course}
            sessions={courseSessions.filter(
              (session) => session.courseSlug === course.slug
            )}
          />
        ))}
      </div>
    </div>
  );
}
