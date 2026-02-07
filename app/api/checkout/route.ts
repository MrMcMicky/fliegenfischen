import { NextResponse } from "next/server";

import type { CheckoutPayload } from "@/lib/checkout";
import { createCheckoutBooking } from "@/lib/checkout";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { sendInvoiceMail } from "@/lib/email";
import { buildInvoiceData } from "@/lib/invoice";
import { renderInvoicePdf } from "@/lib/invoice-pdf";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as CheckoutPayload | null;

    if (payload?.paymentMode === "STRIPE") {
      return NextResponse.json({ error: "use_stripe_checkout" }, { status: 400 });
    }

    const result = await createCheckoutBooking(payload, "INVOICE");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await prisma.payment.upsert({
      where: { bookingId: result.booking.id },
      create: {
        bookingId: result.booking.id,
        status: "PENDING",
      },
      update: {
        status: "PENDING",
      },
    });

    const invoiceData = await buildInvoiceData(result.booking.id);
    if (invoiceData) {
      try {
        const pdfBytes = await renderInvoicePdf(invoiceData);
        const invoiceUrl = `${env.appUrl}/api/invoice/pdf?bookingId=${result.booking.id}`;
        await sendInvoiceMail({
          to: result.booking.customerEmail,
          customerName: result.booking.customerName,
          invoiceNumber: invoiceData.invoiceNumber,
          amountCHF: invoiceData.totalCHF,
          dueDate: invoiceData.dueDate,
          invoiceUrl,
          pdfBytes,
        });
      } catch (error) {
        console.error("invoice email failed", error);
      }
    }

    return NextResponse.json({ invoice: true, bookingId: result.booking.id });
  } catch (error) {
    console.error("checkout failed", error);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
