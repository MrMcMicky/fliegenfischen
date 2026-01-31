import Link from "next/link";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({ orderBy: { title: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Kurse</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Kurs-Typen und Inhalte verwalten.
          </p>
        </div>
        <Link
          href="/admin/kurse/neu"
          className="rounded-full bg-[var(--color-forest)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Neuer Kurs
        </Link>
      </div>
      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/admin/kurse/${course.id}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm"
          >
            <div>
              <p className="font-semibold text-[var(--color-text)]">{course.title}</p>
              <p className="text-[var(--color-muted)]">{course.slug}</p>
            </div>
            <span className="text-[var(--color-forest)]">Bearbeiten</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
