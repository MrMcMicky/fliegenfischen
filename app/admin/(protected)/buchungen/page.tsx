import { prisma } from "@/lib/db";
import { bookingStatusLabels, bookingTypeLabels } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { markBookingPaid } from "@/lib/booking-service";

export const dynamic = "force-dynamic";

export default async function AdminBuchungenPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { payment: true },
  });

  async function updateStatus(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const statusValue = String(formData.get("status") || "PENDING");
    const status =
      statusValue === "PAYMENT_PENDING"
        ? "PAYMENT_PENDING"
        : statusValue === "PAID"
          ? "PAID"
          : statusValue === "INVOICE_REQUESTED"
            ? "INVOICE_REQUESTED"
            : statusValue === "CANCELLED"
              ? "CANCELLED"
              : "PENDING";
    if (!id) return;

    if (status === "PAID") {
      await markBookingPaid({ bookingId: id });
    } else {
      await prisma.booking.update({
        where: { id },
        data: { status },
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Buchungen</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Zahlungen, Rechnungen und Anfragen.
        </p>
      </div>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  {booking.customerName} · {bookingTypeLabels[booking.type]}
                </p>
                <p className="text-[var(--color-muted)]">
                  {booking.customerEmail} · {formatPrice(booking.amountCHF)}
                </p>
                <p className="text-[var(--color-muted)]">
                  {bookingStatusLabels[booking.status] ?? booking.status}
                </p>
                {booking.paymentMode === "STRIPE" ? (
                  <p className="text-[var(--color-muted)]">
                    Stripe bestätigt: {booking.payment?.stripePaymentIntentId ? "Ja" : "Nein"}
                  </p>
                ) : null}
              </div>
              <form action={updateStatus} className="flex flex-col items-end gap-2">
                <input type="hidden" name="id" value={booking.id} />
                <div className="flex items-center gap-2">
                  <select
                    name="status"
                    defaultValue={booking.status}
                    className="form-input px-3 py-2"
                  >
                    <option value="PENDING">Offen</option>
                    <option value="PAYMENT_PENDING">Zahlung offen</option>
                    <option value="PAID">Bezahlt (manuell)</option>
                    <option value="INVOICE_REQUESTED">Rechnung angefragt</option>
                    <option value="CANCELLED">Storniert</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                  >
                    Update
                  </button>
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Hinweis: Stripe-Zahlungen werden automatisch bestätigt.
                </p>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
