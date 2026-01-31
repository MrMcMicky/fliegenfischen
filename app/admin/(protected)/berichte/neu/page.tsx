import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default function AdminReportNewPage() {
  async function createReport(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const year = String(formData.get("year") || "").trim();
    const summary = String(formData.get("summary") || "").trim();
    const body = String(formData.get("body") || "").trim();
    const highlights = parseLines(String(formData.get("highlights") || ""));

    await prisma.report.create({
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Neuer Bericht</h2>
      </div>
      <form action={createReport} className="space-y-4">
        <input name="title" required placeholder="Titel" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <input name="slug" required placeholder="slug" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <div className="grid gap-4 md:grid-cols-2">
          <input name="location" placeholder="Ort" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="year" placeholder="Jahr" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
        </div>
        <textarea name="summary" placeholder="Summary" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="body" placeholder="Inhalt" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" rows={6} />
        <textarea name="highlights" placeholder="Highlights (eine Zeile pro Punkt)" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <button type="submit" className="rounded-full bg-[var(--color-forest)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
          Speichern
        </button>
      </form>
    </div>
  );
}
