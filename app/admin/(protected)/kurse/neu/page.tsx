import { redirect } from "next/navigation";

import { CourseImagePicker } from "@/components/admin/CourseImagePicker";
import { prisma } from "@/lib/db";
import { getCourseImageOptions } from "@/lib/course-images";
import { parseLines } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default async function AdminCourseNewPage() {
  const courseImages = await getCourseImageOptions();

  async function createCourse(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
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

    await prisma.course.create({
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Neuer Kurs</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Kursdaten erfassen.
        </p>
      </div>
      <form action={createCourse} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="title" required placeholder="Titel" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="slug" required placeholder="slug" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <select name="level" className="rounded-lg border border-[var(--color-border)] px-3 py-2">
            <option value="EINSTEIGER">Einsteiger</option>
            <option value="LEICHT_FORTGESCHRITTEN">Leicht Fortgeschritten</option>
            <option value="FORTGESCHRITTEN">Fortgeschritten</option>
          </select>
          <select name="category" className="rounded-lg border border-[var(--color-border)] px-3 py-2">
            <option value="EINHAND">Einhand</option>
            <option value="ZWEIHAND">Zweihand</option>
            <option value="PRIVAT">Privat</option>
            <option value="SCHNUPPERN">Schnuppern</option>
          </select>
          <input name="duration" placeholder="Dauer (z.B. 09:00-16:00)" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="location" placeholder="Ort" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="priceCHF" type="number" placeholder="Preis CHF" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="maxParticipants" type="number" placeholder="Max. Teilnehmer" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
        </div>
        <textarea name="summary" placeholder="Kurzbeschreibung" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="description" placeholder="Beschreibung" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <CourseImagePicker availableImages={courseImages} />
        <input
          name="imageAlt"
          placeholder="Bild Alt Text"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
        <textarea name="highlights" placeholder="Highlights (eine Zeile pro Punkt)" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="equipment" placeholder="Ausrüstung (eine Zeile pro Punkt)" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="includes" placeholder="Inklusive (eine Zeile pro Punkt)" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="prerequisites" placeholder="Voraussetzungen (eine Zeile pro Punkt)" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <button
          type="submit"
          className="rounded-full bg-[var(--color-forest)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
