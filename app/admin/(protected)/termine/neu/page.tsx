import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminTermineNewPage() {
  const courses = await prisma.course.findMany({ orderBy: { title: "asc" } });

  async function createSession(formData: FormData) {
    "use server";

    const courseId = String(formData.get("courseId") || "");
    const date = String(formData.get("date") || "");
    const startTime = String(formData.get("startTime") || "");
    const endTime = String(formData.get("endTime") || "");
    const location = String(formData.get("location") || "");
    const priceCHF = Number(formData.get("priceCHF") || 0);
    const availableSpots = Number(formData.get("availableSpots") || 0);
    const statusValue = String(formData.get("status") || "VERFUEGBAR");
    const status =
      statusValue === "AUSGEBUCHT"
        ? "AUSGEBUCHT"
        : statusValue === "ABGESAGT"
          ? "ABGESAGT"
          : "VERFUEGBAR";
    const notes = String(formData.get("notes") || "");

    await prisma.courseSession.create({
      data: {
        courseId,
        date: new Date(date),
        startTime,
        endTime,
        location,
        priceCHF,
        availableSpots,
        status,
        notes: notes
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      },
    });

    redirect("/admin/termine");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Neuer Termin</h2>
        <p className="text-sm text-[var(--color-muted)]">Kursdatum erfassen.</p>
      </div>
      <form action={createSession} className="space-y-6">
        <select name="courseId" className="form-input px-3 py-2">
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <div className="grid gap-4 md:grid-cols-2">
          <input name="date" type="date" required className="form-input px-3 py-2" />
          <input name="location" placeholder="Ort" className="form-input px-3 py-2" />
          <input name="startTime" placeholder="Startzeit" className="form-input px-3 py-2" />
          <input name="endTime" placeholder="Endzeit" className="form-input px-3 py-2" />
          <input name="priceCHF" type="number" placeholder="Preis CHF" className="form-input px-3 py-2" />
          <input name="availableSpots" type="number" placeholder="Plätze" className="form-input px-3 py-2" />
          <select name="status" className="form-input px-3 py-2">
            <option value="VERFUEGBAR">Verfügbar</option>
            <option value="AUSGEBUCHT">Ausgebucht</option>
            <option value="ABGESAGT">Abgesagt</option>
          </select>
        </div>
        <textarea name="notes" placeholder="Notizen (eine Zeile pro Punkt)" className="w-full form-input px-3 py-2" />
        <button
          type="submit"
          className="rounded-full bg-[var(--color-ember)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
