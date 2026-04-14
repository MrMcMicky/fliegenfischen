import Link from "next/link";

import { prisma } from "@/lib/db";
import { voucherStatusLabels } from "@/lib/vouchers";

export const dynamic = "force-dynamic";

export default async function AdminGutscheinePage() {
  const [options, vouchers] = await Promise.all([
    prisma.voucherOption.findMany({ orderBy: { title: "asc" } }),
    prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        booking: {
          include: {
            voucherOption: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Gutscheine</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Gutscheinoptionen und ausgegebene Gutscheine.
          </p>
        </div>
        <Link
          href="/admin/gutscheine/neu"
          className="rounded-full bg-[var(--color-ember)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
        >
          Neue Option
        </Link>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <Link
            key={option.id}
            href={`/admin/gutscheine/${option.id}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm"
          >
            <div>
              <p className="font-semibold text-[var(--color-text)]">{option.title}</p>
              <p className="text-[var(--color-muted)]">{option.kind}</p>
            </div>
            <span className="text-[var(--color-forest)]">Bearbeiten</span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
          Letzte Gutscheine
        </p>
        <div className="mt-4 space-y-2 text-sm">
          {vouchers.map((voucher) => (
            <Link
              key={voucher.id}
              href={`/gutscheine/pruefen?code=${voucher.code}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] px-4 py-3 transition hover:bg-[var(--color-stone)]"
            >
              <div>
                <p className="font-semibold uppercase tracking-[0.08em] text-[var(--color-text)]">
                  {voucher.code}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {voucher.booking?.voucherOption?.title || "Gutschein"} · {voucherStatusLabels[voucher.status]}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--color-text)]">
                  CHF {voucher.remainingAmount}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Prüfen / einlösen
                </p>
              </div>
            </Link>
          ))}
          {!vouchers.length ? (
            <p className="text-[var(--color-muted)]">Noch keine Gutscheine.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
