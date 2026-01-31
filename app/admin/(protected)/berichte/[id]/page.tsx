import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default async function AdminReportEditPage({
  params,
}: {
  params: { id: string };
}) {
  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    redirect("/admin/berichte");
  }

  async function updateReport(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const year = String(formData.get("year") || "").trim();
    const summary = String(formData.get("summary") || "").trim();
    const body = String(formData.get("body") || "").trim();
    const highlights = parseLines(String(formData.get("highlights") || ""));

    await prisma.report.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        location,
        year,
        summary,
        body,
        highlights,
      },
    });

    redirect("/admin/berichte");
  }

  async function deleteReport() {
    "use server";
    await prisma.report.delete({ where: { id: params.id } });
    redirect("/admin/berichte");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Bericht bearbeiten</h2>
      </div>
      <form action={updateReport} className="space-y-4">
        <input
          name="title"
          required
          defaultValue={report.title}
          placeholder="Titel"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
        <input
          name="slug"
          required
          defaultValue={report.slug}
          placeholder="slug"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <input
            name="location"
            defaultValue={report.location}
            placeholder="Ort"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2"
          />
          <input
            name="year"
            defaultValue={report.year}
            placeholder="Jahr"
            className="rounded-lg border border-[var(--color-border)] px-3 py-2"
          />
        </div>
        <textarea
          name="summary"
          defaultValue={report.summary}
          placeholder="Summary"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
        <textarea
          name="body"
          defaultValue={report.body}
          placeholder="Inhalt"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
          rows={6}
        />
        <textarea
          name="highlights"
          defaultValue={report.highlights.join("\n")}
          placeholder="Highlights"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-[var(--color-forest)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Speichern
          </button>
          <button formAction={deleteReport} className="rounded-full border border-red-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
            Löschen
          </button>
        </div>
      </form>
    </div>
  );
}
