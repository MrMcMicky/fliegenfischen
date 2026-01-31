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
        <input
          name="title"
          required
          defaultValue={option.title}
          placeholder="Titel"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
        <textarea
          name="description"
          defaultValue={option.description}
          placeholder="Beschreibung"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
        <select
          name="kind"
          defaultValue={option.kind}
          className="rounded-lg border border-[var(--color-border)] px-3 py-2"
        >
          <option value="VALUE">Wertgutschein</option>
          <option value="COURSE">Kursgutschein</option>
        </select>
        <textarea
          name="values"
          defaultValue={option.values.join("\n")}
          placeholder="Werte (eine Zahl pro Zeile)"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[var(--color-forest)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
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
