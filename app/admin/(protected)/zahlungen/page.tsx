import { prisma } from "@/lib/db";
import { paymentStatusLabels } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminZahlungenPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { booking: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Zahlungen</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Stripe und manuelle Zahlungen.
        </p>
      </div>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  {payment.booking.customerName}
                </p>
                <p className="text-[var(--color-muted)]">
                  {paymentStatusLabels[payment.status] ?? payment.status}
                </p>
                <p className="text-[var(--color-muted)]">
                  {formatPrice(payment.booking.amountCHF)} · {payment.booking.type}
                </p>
              </div>
              <div className="text-xs text-[var(--color-muted)]">
                <div>Session: {payment.stripeCheckoutSessionId || "-"}</div>
                <div>Intent: {payment.stripePaymentIntentId || "-"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
