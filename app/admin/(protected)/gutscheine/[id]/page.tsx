import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default async function AdminGutscheinEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  if (!id) {
    redirect("/admin/gutscheine");
  }
  const option = await prisma.voucherOption.findUnique({
    where: { id },
  });

  if (!option) {
    redirect("/admin/gutscheine");
  }

  async function updateOption(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const kindValue = String(formData.get("kind") || "VALUE");
    const kind = kindValue === "COURSE" ? "COURSE" : "VALUE";
    const values = parseLines(String(formData.get("values") || ""))
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    await prisma.voucherOption.update({
      where: { id },
      data: {
        title,
        description,
        kind,
        values,
      },
    });

    redirect("/admin/gutscheine");
  }

  async function deleteOption() {
    "use server";
    await prisma.voucherOption.delete({ where: { id } });
    redirect("/admin/gutscheine");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Gutscheinoption bearbeiten</h2>
      </div>
      <form action={updateOption} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="voucher-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Titel (sichtbar auf der Website)
          </label>
          <input
            id="voucher-title"
            name="title"
            required
            defaultValue={option.title}
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
            defaultValue={option.description}
            placeholder="Kurzer Text unter dem Titel."
            className="w-full form-input px-3 py-2"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="voucher-kind" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Gutschein‑Typ
          </label>
          <select
            id="voucher-kind"
            name="kind"
            defaultValue={option.kind}
            className="form-input px-3 py-2"
          >
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
            defaultValue={option.values.join("\n")}
            placeholder="z. B. 100\n150\n200"
            className="w-full form-input px-3 py-2"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--color-ember)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
          >
            Speichern
          </button>
          <button
            formAction={deleteOption}
            className="rounded-full border border-red-300 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600"
          >
            Löschen
          </button>
        </div>
      </form>
    </div>
  );
}
