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
          Preise und Texte für Privatunterricht und Schnupperstunden. Diese Angaben
          erscheinen auf der Website und im Checkout.
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
                className="rounded-full bg-[var(--color-ember)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
              >
                Speichern
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor={`${lesson.type}-title`} className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Angebots‑Titel (sichtbar auf der Website)
                </label>
                <input
                  id={`${lesson.type}-title`}
                  name="title"
                  defaultValue={lesson.title}
                  placeholder="z. B. Privatunterricht"
                  className="form-input px-3 py-2"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${lesson.type}-price`} className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Preis pro Stunde (CHF)
                </label>
                <input
                  id={`${lesson.type}-price`}
                  name="priceCHF"
                  type="number"
                  defaultValue={lesson.priceCHF}
                  placeholder="z. B. 70"
                  className="form-input px-3 py-2"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${lesson.type}-min-hours`} className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Mindestdauer (Stunden)
                </label>
                <input
                  id={`${lesson.type}-min-hours`}
                  name="minHours"
                  type="number"
                  defaultValue={lesson.minHours}
                  placeholder="z. B. 2"
                  className="form-input px-3 py-2"
                />
                <p className="text-xs text-[var(--color-muted)]">
                  Wird im Text „Mindestens X Stunden“ angezeigt.
                </p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor={`${lesson.type}-additional`} className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Zuschlag pro zusätzlicher Person (CHF)
                </label>
                <input
                  id={`${lesson.type}-additional`}
                  name="additionalPersonCHF"
                  type="number"
                  defaultValue={lesson.additionalPersonCHF}
                  placeholder="z. B. 40"
                  className="form-input px-3 py-2"
                />
                <p className="text-xs text-[var(--color-muted)]">
                  Beispiel: „jede weitere Person +CHF X / Std.“
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${lesson.type}-description`} className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Kurzbeschreibung (1–2 Sätze)
              </label>
              <textarea
                id={`${lesson.type}-description`}
                name="description"
                defaultValue={lesson.description}
                placeholder="Wird unter dem Titel angezeigt."
                className="w-full form-input px-3 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${lesson.type}-bullets`} className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Stichpunkte (Liste)
              </label>
              <textarea
                id={`${lesson.type}-bullets`}
                name="bullets"
                defaultValue={lesson.bullets.join("\n")}
                placeholder="Eine Zeile pro Punkt (z. B. Termine nach Vereinbarung)"
                className="w-full form-input px-3 py-2"
              />
              <p className="text-xs text-[var(--color-muted)]">Jede Zeile wird als Bullet angezeigt.</p>
            </div>
          </form>
        );
      })}
    </div>
  );
}
