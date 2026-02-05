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
        <div className="space-y-1.5">
          <label htmlFor="voucher-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Titel (sichtbar auf der Website)
          </label>
          <input
            id="voucher-title"
            name="title"
            required
            placeholder="z. B. Wertgutschein"
            className="w-full form-input px-3 py-2"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="voucher-description" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Beschreibung (Kurztext)
          </label>
          <textarea
            id="voucher-description"
            name="description"
            placeholder="Kurzer Text unter dem Titel."
            className="w-full form-input px-3 py-2"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="voucher-kind" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Gutschein‑Typ
          </label>
          <select id="voucher-kind" name="kind" className="form-input px-3 py-2">
            <option value="VALUE">Wertgutschein</option>
            <option value="COURSE">Kursgutschein</option>
          </select>
          <p className="text-xs text-[var(--color-muted)]">
            Wertgutschein = Betrag frei wählbar aus der Liste, Kursgutschein = fester Kurs.
          </p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="voucher-values" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Beträge (eine Zahl pro Zeile, CHF)
          </label>
          <textarea
            id="voucher-values"
            name="values"
            placeholder="z. B. 100\n150\n200"
            className="w-full form-input px-3 py-2"
          />
        </div>
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
