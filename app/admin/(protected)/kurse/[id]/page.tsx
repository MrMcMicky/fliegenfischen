import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) {
    redirect("/admin/kurse");
  }

  async function updateCourse(formData: FormData) {
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

    await prisma.course.update({
      where: { id: params.id },
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
    await prisma.course.delete({ where: { id: params.id } });
    redirect("/admin/kurse");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Kurs bearbeiten</h2>
        <p className="text-sm text-[var(--color-muted)]">{course.title}</p>
      </div>
      <form action={updateCourse} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="title" required defaultValue={course.title} placeholder="Titel" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="slug" required defaultValue={course.slug} placeholder="slug" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <select name="level" defaultValue={course.level} className="rounded-lg border border-[var(--color-border)] px-3 py-2">
            <option value="EINSTEIGER">Einsteiger</option>
            <option value="LEICHT_FORTGESCHRITTEN">Leicht Fortgeschritten</option>
            <option value="FORTGESCHRITTEN">Fortgeschritten</option>
          </select>
          <select name="category" defaultValue={course.category} className="rounded-lg border border-[var(--color-border)] px-3 py-2">
            <option value="EINHAND">Einhand</option>
            <option value="ZWEIHAND">Zweihand</option>
            <option value="PRIVAT">Privat</option>
            <option value="SCHNUPPERN">Schnuppern</option>
          </select>
          <input name="duration" defaultValue={course.duration} placeholder="Dauer" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="location" defaultValue={course.location} placeholder="Ort" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="priceCHF" type="number" defaultValue={course.priceCHF} placeholder="Preis CHF" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="maxParticipants" type="number" defaultValue={course.maxParticipants} placeholder="Max. Teilnehmer" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
        </div>
        <textarea name="summary" defaultValue={course.summary} placeholder="Kurzbeschreibung" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="description" defaultValue={course.description} placeholder="Beschreibung" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <div className="grid gap-4 md:grid-cols-2">
          <input name="imageSrc" defaultValue={course.imageSrc || ""} placeholder="Bild URL" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="imageAlt" defaultValue={course.imageAlt || ""} placeholder="Bild Alt Text" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
        </div>
        <textarea name="highlights" defaultValue={course.highlights.join("\n")} placeholder="Highlights" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="equipment" defaultValue={course.equipment.join("\n")} placeholder="Ausruestung" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="includes" defaultValue={course.includes.join("\n")} placeholder="Inklusive" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="prerequisites" defaultValue={course.prerequisites.join("\n")} placeholder="Voraussetzungen" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--color-forest)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Speichern
          </button>
          <button
            formAction={deleteCourse}
            className="rounded-full border border-red-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
          >
            Loeschen
          </button>
        </div>
      </form>
    </div>
  );
}
