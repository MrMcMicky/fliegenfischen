import { redirect } from "next/navigation";

import { CourseImagePicker } from "@/components/admin/CourseImagePicker";
import { prisma } from "@/lib/db";
import { getCourseImageOptions } from "@/lib/course-images";
import { parseLines, slugify } from "@/lib/admin-utils";
import { getAdminFromSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  if (!id) {
    redirect("/admin/kurse");
  }
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) {
    redirect("/admin/kurse");
  }
  const existingSlug = course.slug;
  const admin = await getAdminFromSession();
  const isSuperAdmin = admin?.role === "SUPER_ADMIN";
  const courseImages = await getCourseImageOptions();

  async function updateCourse(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const slugInput = String(formData.get("slug") || "").trim();
    const levelValue = String(formData.get("level") || "EINSTEIGER");
    const categoryValue = String(formData.get("category") || "EINHAND");
    const level =
      levelValue === "FORTGESCHRITTEN"
        ? "FORTGESCHRITTEN"
        : levelValue === "LEICHT_FORTGESCHRITTEN"
          ? "LEICHT_FORTGESCHRITTEN"
          : "EINSTEIGER";
    const category =
      categoryValue === "ZWEIHAND"
        ? "ZWEIHAND"
        : categoryValue === "PRIVAT"
          ? "PRIVAT"
          : categoryValue === "SCHNUPPERN"
            ? "SCHNUPPERN"
            : "EINHAND";
    const summary = String(formData.get("summary") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const imageSrc = String(formData.get("imageSrc") || "").trim();
    const imageAlt = String(formData.get("imageAlt") || "").trim();
    const duration = String(formData.get("duration") || "").trim();
    const priceCHF = Number(formData.get("priceCHF") || 0);
    const maxParticipants = Number(formData.get("maxParticipants") || 0);
    const location = String(formData.get("location") || "").trim();
    const isSuperAdminAction = (await getAdminFromSession())?.role === "SUPER_ADMIN";
    const slug = isSuperAdminAction
      ? slugInput || slugify(title)
      : existingSlug || slugify(title);

    await prisma.course.update({
      where: { id },
      data: {
        title,
        slug,
        level,
        category,
        summary,
        description,
        imageSrc: imageSrc || null,
        imageAlt: imageAlt || null,
        duration,
        priceCHF,
        maxParticipants,
        location,
        highlights: parseLines(String(formData.get("highlights") || "")),
        equipment: parseLines(String(formData.get("equipment") || "")),
        includes: parseLines(String(formData.get("includes") || "")),
        prerequisites: parseLines(String(formData.get("prerequisites") || "")),
      },
    });

    redirect("/admin/kurse");
  }

  async function deleteCourse() {
    "use server";
    await prisma.course.delete({ where: { id } });
    redirect("/admin/kurse");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Kurs bearbeiten</h2>
        <p className="text-sm text-[var(--color-muted)]">{course.title}</p>
      </div>
      <form action={updateCourse} className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Basisdaten</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Titel, URL und Einordnung des Kurses.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="course-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Kurstitel
              </label>
              <input
                id="course-title"
                name="title"
                required
                defaultValue={course.title}
                placeholder="z. B. Einhand Wurfkurs Einsteiger"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Erscheint in Karten & Kursdetail.</p>
            </div>
            {isSuperAdmin ? (
              <div className="space-y-1.5">
                <label htmlFor="course-slug" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  URL‑Slug
                </label>
                <input
                  id="course-slug"
                  name="slug"
                  required
                  defaultValue={course.slug}
                  placeholder="z. B. einhand-einsteiger"
                  className="form-input px-3 py-2"
                />
                <p className="text-xs text-[var(--color-muted)]">
                  Wird Teil der URL: /kurse/slug. (nur Super Admin)
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  URL‑Slug
                </p>
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-stone)] px-3 py-2 text-sm text-[var(--color-muted)]">
                  {course.slug}
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Technisch, wird automatisch aus dem Titel abgeleitet. (nur Super Admin änderbar)
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="course-level" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Niveau
              </label>
              <select id="course-level" name="level" defaultValue={course.level} className="form-input px-3 py-2">
                <option value="EINSTEIGER">Einsteiger</option>
                <option value="LEICHT_FORTGESCHRITTEN">Leicht Fortgeschritten</option>
                <option value="FORTGESCHRITTEN">Fortgeschritten</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="course-category" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Kategorie
              </label>
              <select id="course-category" name="category" defaultValue={course.category} className="form-input px-3 py-2">
                <option value="EINHAND">Einhand</option>
                <option value="ZWEIHAND">Zweihand</option>
                <option value="PRIVAT">Privat</option>
                <option value="SCHNUPPERN">Schnuppern</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Rahmen & Preis</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Standardwerte, die auf der Kursseite angezeigt werden.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="course-duration" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Dauer / Zeitfenster
              </label>
              <input
                id="course-duration"
                name="duration"
                defaultValue={course.duration}
                placeholder="z. B. 09:00–16:00"
                className="form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="course-location" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Ort
              </label>
              <input
                id="course-location"
                name="location"
                defaultValue={course.location}
                placeholder="z. B. Limmat (Dietikon/Wettingen)"
                className="form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="course-price" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Standardpreis (CHF)
              </label>
              <input
                id="course-price"
                name="priceCHF"
                type="number"
                defaultValue={course.priceCHF}
                placeholder="z. B. 200"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Wird in Kurskarten/Details angezeigt.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="course-participants" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Max. Teilnehmer
              </label>
              <input
                id="course-participants"
                name="maxParticipants"
                type="number"
                defaultValue={course.maxParticipants}
                placeholder="z. B. 6"
                className="form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Hinweis auf der Kursseite.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Texte</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Kurztext für Karten und ausführliche Beschreibung für die Detailseite.
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="course-summary" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Kurzbeschreibung
            </label>
            <textarea
              id="course-summary"
              name="summary"
              defaultValue={course.summary}
              placeholder="1–2 Sätze für die Kurskarte."
              className="w-full form-input px-3 py-2"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="course-description" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Ausführliche Beschreibung
            </label>
            <textarea
              id="course-description"
              name="description"
              defaultValue={course.description}
              placeholder="Mehrzeiliger Text für die Detailseite."
              className="w-full form-input px-3 py-2"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Kursbild</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Bild für Kurskarten und Kursdetail.
            </p>
          </div>
          <CourseImagePicker
            availableImages={courseImages}
            initialSrc={course.imageSrc}
          />
          <div className="space-y-1.5">
            <label htmlFor="course-image-alt" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Bild‑Beschreibung (Alt‑Text)
            </label>
            <input
              id="course-image-alt"
              name="imageAlt"
              defaultValue={course.imageAlt || ""}
              placeholder="z. B. Illustration Einhand Fliegenfischen"
              className="w-full form-input px-3 py-2"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <div>
            <h3 className="font-display text-lg font-semibold">Listen & Voraussetzungen</h3>
            <p className="text-xs text-[var(--color-muted)]">
              Jede Zeile wird als eigener Bullet‑Point angezeigt.
            </p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="course-highlights" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Highlights
            </label>
            <textarea
              id="course-highlights"
              name="highlights"
              defaultValue={course.highlights.join("\n")}
              placeholder="Eine Zeile pro Punkt."
              className="w-full form-input px-3 py-2"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="course-equipment" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Ausrüstung (mitbringen)
            </label>
            <textarea
              id="course-equipment"
              name="equipment"
              defaultValue={course.equipment.join("\n")}
              placeholder="Eine Zeile pro Punkt."
              className="w-full form-input px-3 py-2"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="course-includes" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Inklusive (wir stellen)
            </label>
            <textarea
              id="course-includes"
              name="includes"
              defaultValue={course.includes.join("\n")}
              placeholder="Eine Zeile pro Punkt."
              className="w-full form-input px-3 py-2"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="course-prerequisites" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Voraussetzungen
            </label>
            <textarea
              id="course-prerequisites"
              name="prerequisites"
              defaultValue={course.prerequisites.join("\n")}
              placeholder="Eine Zeile pro Punkt."
              className="w-full form-input px-3 py-2"
            />
          </div>
        </section>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--color-ember)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
          >
            Speichern
          </button>
          <button
            formAction={deleteCourse}
            className="rounded-full border border-red-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
          >
            Löschen
          </button>
        </div>
      </form>
    </div>
  );
}
