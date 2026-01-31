import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAnfragenPage() {
  const requests = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  const activeRequests = requests.filter(
    (request) => request.status !== "ARCHIVED"
  );
  const archivedRequests = requests.filter(
    (request) => request.status === "ARCHIVED"
  );

  async function markDone(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    if (!id) return;
    await prisma.contactRequest.update({
      where: { id },
      data: { status: "DONE" },
    });
    revalidatePath("/admin/anfragen");
  }

  async function archiveRequest(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    if (!id) return;
    await prisma.contactRequest.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    revalidatePath("/admin/anfragen");
  }

  async function reopenRequest(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    if (!id) return;
    await prisma.contactRequest.update({
      where: { id },
      data: { status: "OPEN" },
    });
    revalidatePath("/admin/anfragen");
  }

  const statusLabel: Record<string, string> = {
    OPEN: "Neu",
    DONE: "Erledigt",
    ARCHIVED: "Archiv",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
        <h2 className="font-display text-2xl font-semibold">Kontaktanfragen</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Alle Anfragen aus dem Kontaktformular.
        </p>
      </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          <a
            href="/api/admin/contact-requests/export?status=all"
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-[var(--color-forest)]"
          >
            CSV exportieren
          </a>
        </div>
      </div>
      <div className="space-y-4">
        {activeRequests.map((request) => (
          <div
            key={request.id}
            className="rounded-2xl border border-[var(--color-border)] bg-white p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                  {formatDate(request.createdAt)} ·{" "}
                  {request.subject?.trim() || "Kontaktanfrage"}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                  {request.name}
                </p>
                <div className="mt-1 text-sm text-[var(--color-muted)]">
                  <a
                    href={`mailto:${request.email}`}
                    className="hover:text-[var(--color-forest)]"
                  >
                    {request.email}
                  </a>
                  {request.phone ? (
                    <span>
                      {" "}
                      ·{" "}
                      <a
                        href={`tel:${request.phone}`}
                        className="hover:text-[var(--color-forest)]"
                      >
                        {request.phone}
                      </a>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs">
                <span className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-forest)]/80">
                  {statusLabel[request.status] ?? request.status}
                </span>
                <div className="flex flex-wrap gap-2">
                  {request.status !== "DONE" ? (
                    <form action={markDone}>
                      <input type="hidden" name="id" value={request.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]"
                      >
                        Erledigt
                      </button>
                    </form>
                  ) : (
                    <form action={reopenRequest}>
                      <input type="hidden" name="id" value={request.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]"
                      >
                        Zurücksetzen
                      </button>
                    </form>
                  )}
                  <form action={archiveRequest}>
                    <input type="hidden" name="id" value={request.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]"
                    >
                      Archivieren
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--color-muted)]">
              {request.message}
            </p>
          </div>
        ))}
        {!activeRequests.length ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
            Noch keine offenen Anfragen.
          </div>
        ) : null}
      </div>
      <div className="space-y-4">
        <h3 className="font-display text-xl font-semibold text-[var(--color-text)]">
          Archiv
        </h3>
        {archivedRequests.map((request) => (
          <div
            key={request.id}
            className="rounded-2xl border border-[var(--color-border)] bg-white/70 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                  {formatDate(request.createdAt)} ·{" "}
                  {request.subject?.trim() || "Kontaktanfrage"}
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                  {request.name}
                </p>
                <div className="mt-1 text-sm text-[var(--color-muted)]">
                  <a
                    href={`mailto:${request.email}`}
                    className="hover:text-[var(--color-forest)]"
                  >
                    {request.email}
                  </a>
                  {request.phone ? (
                    <span>
                      {" "}
                      ·{" "}
                      <a
                        href={`tel:${request.phone}`}
                        className="hover:text-[var(--color-forest)]"
                      >
                        {request.phone}
                      </a>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs">
                <span className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-forest)]/80">
                  {statusLabel[request.status] ?? request.status}
                </span>
                <form action={reopenRequest}>
                  <input type="hidden" name="id" value={request.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]"
                  >
                    Zurücksetzen
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--color-muted)]">
              {request.message}
            </p>
          </div>
        ))}
        {!archivedRequests.length ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
            Keine archivierten Anfragen.
          </div>
        ) : null}
      </div>
    </div>
  );
}
