import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAnfragenPage() {
  const requests = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Kontaktanfragen</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Alle Anfragen aus dem Kontaktformular.
        </p>
      </div>
      <div className="space-y-4">
        {requests.map((request) => (
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
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--color-muted)]">
              {request.message}
            </p>
          </div>
        ))}
        {!requests.length ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
            Noch keine Anfragen.
          </div>
        ) : null}
      </div>
    </div>
  );
}
