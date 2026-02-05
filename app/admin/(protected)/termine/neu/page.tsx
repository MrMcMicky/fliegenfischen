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
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Termin-Daten</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Dieser Termin erscheint in der Kursübersicht und im Checkout.
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="session-course" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Kurs auswählen
            </label>
            <select id="session-course" name="courseId" className="form-input px-3 py-2">
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="session-date" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Datum
              </label>
              <input id="session-date" name="date" type="date" required className="form-input px-3 py-2" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="session-location" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Ort (falls abweichend)
              </label>
              <input id="session-location" name="location" placeholder="z. B. Limmat (Dietikon/Wettingen)" className="form-input px-3 py-2" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="session-start" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Startzeit
              </label>
              <input id="session-start" name="startTime" placeholder="z. B. 09:00" className="form-input px-3 py-2" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="session-end" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Endzeit
              </label>
              <input id="session-end" name="endTime" placeholder="z. B. 16:00" className="form-input px-3 py-2" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="session-price" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Preis pro Person (CHF)
              </label>
              <input id="session-price" name="priceCHF" type="number" placeholder="z. B. 200" className="form-input px-3 py-2" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="session-spots" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Verfügbare Plätze
              </label>
              <input id="session-spots" name="availableSpots" type="number" placeholder="z. B. 6" className="form-input px-3 py-2" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="session-status" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Status
              </label>
              <select id="session-status" name="status" className="form-input px-3 py-2">
                <option value="VERFUEGBAR">Verfügbar</option>
                <option value="AUSGEBUCHT">Ausgebucht</option>
                <option value="ABGESAGT">Abgesagt</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="session-notes" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Notizen (optional)
            </label>
            <textarea id="session-notes" name="notes" placeholder="Eine Zeile pro Punkt." className="w-full form-input px-3 py-2" />
          </div>
        </section>
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
