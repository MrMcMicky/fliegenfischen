import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default function AdminGutscheinNewPage() {
  async function createOption(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const kindValue = String(formData.get("kind") || "VALUE");
    const kind = kindValue === "COURSE" ? "COURSE" : "VALUE";
    const values = parseLines(String(formData.get("values") || ""))
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    await prisma.voucherOption.create({
      data: {
        title,
        description,
        kind,
        values,
      },
    });

    redirect("/admin/gutscheine");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Neue Gutscheinoption</h2>
        <p className="text-sm text-[var(--color-muted)]">Option erfassen.</p>
      </div>
      <form action={createOption} className="space-y-4">
        <input name="title" required placeholder="Titel" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <textarea name="description" placeholder="Beschreibung" className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2" />
        <select name="kind" className="rounded-lg border border-[var(--color-border)] px-3 py-2">
          <option value="VALUE">Wertgutschein</option>
          <option value="COURSE">Kursgutschein</option>
        </select>
        <textarea
          name="values"
          placeholder="Werte (eine Zahl pro Zeile)"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
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
