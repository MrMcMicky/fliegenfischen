import { CourseCard } from "@/components/CourseCard";
import { SectionHeader } from "@/components/SectionHeader";
import { courseSessions, courses } from "@/lib/courses";

export const metadata = {
  title: "Kurse",
  description:
    "Kursuebersicht fuer Einhand und Zweihand. Kleine Gruppen, klare Lernziele, feste Termine.",
};

export default function KursePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-6 pb-24 pt-16">
      <SectionHeader
        eyebrow="Kurse"
        title="Kursuebersicht"
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
