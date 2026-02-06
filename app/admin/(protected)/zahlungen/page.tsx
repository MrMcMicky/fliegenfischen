import { prisma } from "@/lib/db";
import { bookingTypeLabels, paymentStatusLabels } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminZahlungenPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { booking: true },
  });

  const formatStripeId = (value?: string | null) => {
    if (!value) return "–";
    if (value.length <= 12) return value;
    return `${value.slice(0, 8)}…${value.slice(-6)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Zahlungen</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Übersicht aller Zahlungen. Stripe-Zahlungen gelten erst als bezahlt,
          wenn Stripe sie bestätigt hat.
        </p>
      </div>
      <div className="space-y-3">
        {payments.map((payment) => {
          const isStripe = payment.booking.paymentMode === "STRIPE";
          const stripeConfirmed = Boolean(payment.stripePaymentIntentId);
          const statusLabel =
            isStripe && !stripeConfirmed
              ? "Zahlung offen (Stripe nicht bestätigt)"
              : paymentStatusLabels[payment.status] ?? payment.status;
          const confirmationLabel = isStripe
            ? stripeConfirmed
              ? "Stripe bestätigt"
              : "Stripe nicht bestätigt"
            : payment.status === "PAID"
              ? "Manuell als bezahlt markiert"
              : "Manuell / Rechnung";
          return (
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
                    {statusLabel}
                  </p>
                  <p className="text-[var(--color-muted)]">
                    {formatPrice(payment.booking.amountCHF)} ·{" "}
                    {bookingTypeLabels[payment.booking.type] ??
                      payment.booking.type}
                  </p>
                  <p className="text-[var(--color-muted)]">
                    {isStripe ? "Online-Zahlung (Stripe)" : "Manuell / Rechnung"}
                    {" · "}
                    {confirmationLabel}
                  </p>
                </div>
                <div className="text-xs text-[var(--color-muted)]">
                  <div title={payment.stripeCheckoutSessionId || undefined}>
                    Stripe Checkout-ID:{" "}
                    {formatStripeId(payment.stripeCheckoutSessionId)}
                  </div>
                  <div title={payment.stripePaymentIntentId || undefined}>
                    Stripe Zahlungs-ID:{" "}
                    {formatStripeId(payment.stripePaymentIntentId)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
