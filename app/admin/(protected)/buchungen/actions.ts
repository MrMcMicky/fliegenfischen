"use server";

import type { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { markBookingPaid } from "@/lib/booking-service";
import { buildInvoiceData } from "@/lib/invoice";
import { renderInvoicePdf } from "@/lib/invoice-pdf";
import { sendInvoiceMail } from "@/lib/email";
import { env } from "@/lib/env";

const VALID_STATUSES: BookingStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "INVOICE_REQUESTED",
  "CANCELLED",
];

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const admin = await getAdminFromSession();
  if (!admin) return { ok: false };
  if (!bookingId || !VALID_STATUSES.includes(status)) {
    return { ok: false };
  }

  if (status === "PAID") {
    await markBookingPaid({ bookingId });
  } else {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  return { ok: true };
}

export async function resendInvoiceEmail(bookingId: string) {
  const admin = await getAdminFromSession();
  if (!admin) return { ok: false, error: "unauthorized" };
  if (!bookingId) return { ok: false, error: "missing" };

  const invoiceData = await buildInvoiceData(bookingId);
  if (!invoiceData) return { ok: false, error: "invoice_not_found" };

  try {
    const pdfBytes = await renderInvoicePdf(invoiceData);
    const invoiceUrl = `${env.appUrl}/api/invoice/pdf?bookingId=${bookingId}`;
    await sendInvoiceMail({
      to: invoiceData.customer.email || "",
      customerName: invoiceData.customer.name,
      invoiceNumber: invoiceData.invoiceNumber,
      amountCHF: invoiceData.totalCHF,
      dueDate: invoiceData.dueDate,
      invoiceUrl,
      pdfBytes,
    });
    return { ok: true };
  } catch (error) {
    console.error("invoice resend failed", error);
    return { ok: false, error: "send_failed" };
  }
}
