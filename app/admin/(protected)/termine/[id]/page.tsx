import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminTerminEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  if (!id) {
    redirect("/admin/termine");
  }
  const session = await prisma.courseSession.findUnique({
    where: { id },
  });
  const courses = await prisma.course.findMany({ orderBy: { title: "asc" } });

  if (!session) {
    redirect("/admin/termine");
  }

  async function updateSession(formData: FormData) {
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

    await prisma.courseSession.update({
      where: { id },
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

  async function deleteSession() {
    "use server";
    await prisma.courseSession.delete({ where: { id } });
    redirect("/admin/termine");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Termin bearbeiten</h2>
      </div>
      <form action={updateSession} className="space-y-6">
        <select
          name="courseId"
          defaultValue={session.courseId}
          className="form-input px-3 py-2"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="date"
            type="date"
            defaultValue={session.date.toISOString().split("T")[0]}
            className="form-input px-3 py-2"
          />
          <input
            name="location"
            defaultValue={session.location}
            placeholder="Ort"
            className="form-input px-3 py-2"
          />
          <input
            name="startTime"
            defaultValue={session.startTime}
            placeholder="Startzeit"
            className="form-input px-3 py-2"
          />
          <input
            name="endTime"
            defaultValue={session.endTime}
            placeholder="Endzeit"
            className="form-input px-3 py-2"
          />
          <input
            name="priceCHF"
            type="number"
            defaultValue={session.priceCHF}
            placeholder="Preis CHF"
            className="form-input px-3 py-2"
          />
          <input
            name="availableSpots"
            type="number"
            defaultValue={session.availableSpots}
            placeholder="Plätze"
            className="form-input px-3 py-2"
          />
          <select
            name="status"
            defaultValue={session.status}
            className="form-input px-3 py-2"
          >
            <option value="VERFUEGBAR">Verfügbar</option>
            <option value="AUSGEBUCHT">Ausgebucht</option>
            <option value="ABGESAGT">Abgesagt</option>
          </select>
        </div>
        <textarea
          name="notes"
          defaultValue={session.notes.join("\n")}
          placeholder="Notizen"
          className="w-full form-input px-3 py-2"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--color-ember)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
          >
            Speichern
          </button>
          <button
            formAction={deleteSession}
            className="rounded-full border border-red-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
          >
            Löschen
          </button>
        </div>
      </form>
    </div>
  );
}
