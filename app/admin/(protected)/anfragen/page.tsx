import { revalidatePath } from "next/cache";
import Link from "next/link";

import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type SearchParams = { status?: string };

const statusLabels: Record<string, string> = {
  OPEN: "Neu",
  DONE: "Erledigt",
  ARCHIVED: "Archiv",
};

const statusOptions = ["open", "done", "archived", "all"] as const;
type StatusFilter = (typeof statusOptions)[number];

const resolveFilter = (value?: string): StatusFilter => {
  const normalized = (value || "open").toLowerCase();
  return statusOptions.includes(normalized as StatusFilter)
    ? (normalized as StatusFilter)
    : "open";
};

export default async function AdminAnfragenPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const activeFilter = resolveFilter(resolvedParams?.status);
  const requests = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  const openCount = requests.filter((request) => request.status === "OPEN").length;
  const doneCount = requests.filter((request) => request.status === "DONE").length;
  const archivedCount = requests.filter(
    (request) => request.status === "ARCHIVED"
  ).length;
  const filteredRequests =
    activeFilter === "all"
      ? requests
      : requests.filter(
          (request) => request.status === activeFilter.toUpperCase()
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
            href={`/api/admin/contact-requests/export?status=${activeFilter}`}
            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-[var(--color-forest)]"
          >
            CSV exportieren
          </a>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
        {[
          { label: `Neu (${openCount})`, value: "open" },
          { label: `Erledigt (${doneCount})`, value: "done" },
          { label: `Archiv (${archivedCount})`, value: "archived" },
          { label: `Alle (${requests.length})`, value: "all" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/anfragen?status=${tab.value}`}
            className={`rounded-full border px-4 py-2 ${
              activeFilter === tab.value
                ? "border-transparent bg-[var(--color-forest)] text-white"
                : "border-[var(--color-border)] bg-white text-[var(--color-forest)]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="space-y-4">
        {filteredRequests.map((request) => (
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
                  {statusLabels[request.status] ?? request.status}
                </span>
                <div className="flex flex-wrap gap-2">
                  {request.status === "ARCHIVED" ? (
                    <form action={reopenRequest}>
                      <input type="hidden" name="id" value={request.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] cursor-pointer"
                      >
                        Zurücksetzen
                      </button>
                    </form>
                  ) : request.status !== "DONE" ? (
                    <form action={markDone}>
                      <input type="hidden" name="id" value={request.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] cursor-pointer"
                      >
                        Erledigt
                      </button>
                    </form>
                  ) : (
                    <form action={reopenRequest}>
                      <input type="hidden" name="id" value={request.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] cursor-pointer"
                      >
                        Zurücksetzen
                      </button>
                    </form>
                  )}
                  {request.status !== "ARCHIVED" ? (
                    <form action={archiveRequest}>
                      <input type="hidden" name="id" value={request.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)] cursor-pointer"
                      >
                        Archivieren
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--color-muted)]">
              {request.message}
            </p>
          </div>
        ))}
        {!filteredRequests.length ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
            Keine Anfragen für diesen Filter.
          </div>
        ) : null}
      </div>
    </div>
  );
}
