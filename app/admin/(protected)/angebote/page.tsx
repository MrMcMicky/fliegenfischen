import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default async function AdminAngebotePage() {
  const offerings = await prisma.lessonOffering.findMany();
  const privateLesson = offerings.find((item) => item.type === "PRIVATE");
  const tasterLesson = offerings.find((item) => item.type === "TASTER");

  async function updateOffering(formData: FormData) {
    "use server";

    const typeValue = String(formData.get("type") || "PRIVATE");
    const type = typeValue === "TASTER" ? "TASTER" : "PRIVATE";
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const priceCHF = Number(formData.get("priceCHF") || 0);
    const minHours = Number(formData.get("minHours") || 1);
    const additionalPersonCHF = Number(formData.get("additionalPersonCHF") || 0);
    const bullets = parseLines(String(formData.get("bullets") || ""));

    await prisma.lessonOffering.upsert({
      where: { type },
      update: {
        title,
        description,
        priceCHF,
        minHours,
        additionalPersonCHF,
        bullets,
      },
      create: {
        type,
        title,
        description,
        priceCHF,
        minHours,
        additionalPersonCHF,
        bullets,
      },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold">Angebote</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Privatunterricht und Schnupperstunden verwalten.
        </p>
      </div>

      {[privateLesson, tasterLesson].map((lesson) => {
        if (!lesson) return null;
        return (
          <form
            key={lesson.type}
            action={updateOffering}
            className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-6"
          >
            <input type="hidden" name="type" value={lesson.type} />
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">
                {lesson.type === "PRIVATE" ? "Privatunterricht" : "Schnupperstunden"}
              </h3>
              <button
                type="submit"
                className="rounded-full bg-[var(--color-forest)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Speichern
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                name="title"
                defaultValue={lesson.title}
                placeholder="Titel"
                className="rounded-lg border border-[var(--color-border)] px-3 py-2"
              />
              <input
                name="priceCHF"
                type="number"
                defaultValue={lesson.priceCHF}
                placeholder="Preis CHF"
                className="rounded-lg border border-[var(--color-border)] px-3 py-2"
              />
              <input
                name="minHours"
                type="number"
                defaultValue={lesson.minHours}
                placeholder="Mindeststunden"
                className="rounded-lg border border-[var(--color-border)] px-3 py-2"
              />
              <input
                name="additionalPersonCHF"
                type="number"
                defaultValue={lesson.additionalPersonCHF}
                placeholder="Zusatzperson CHF"
                className="rounded-lg border border-[var(--color-border)] px-3 py-2"
              />
            </div>
            <textarea
              name="description"
              defaultValue={lesson.description}
              placeholder="Beschreibung"
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
            <textarea
              name="bullets"
              defaultValue={lesson.bullets.join("\n")}
              placeholder="Bullet Points"
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            />
          </form>
        );
      })}
    </div>
  );
}
