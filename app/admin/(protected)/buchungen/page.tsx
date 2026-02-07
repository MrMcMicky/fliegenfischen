import BookingTable from "./BookingTable";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBuchungenPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      payment: true,
      courseSession: { include: { course: true } },
    },
  });
  const rows = bookings.map((booking) => ({
    id: booking.id,
    createdAt: booking.createdAt.toISOString(),
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    customerAddressLine1: booking.customerAddressLine1,
    customerAddressLine2: booking.customerAddressLine2,
    customerPostalCode: booking.customerPostalCode,
    customerCity: booking.customerCity,
    customerCountry: booking.customerCountry,
    notes: booking.notes,
    amountCHF: booking.amountCHF,
    status: booking.status,
    type: booking.type,
    paymentMode: booking.paymentMode,
    stripeConfirmed: Boolean(booking.payment?.stripePaymentIntentId),
    title: booking.courseSession?.course?.title || null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Buchungen</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Zahlungen, Rechnungen und Anfragen.
        </p>
      </div>
      <BookingTable rows={rows} />
    </div>
  );
}
