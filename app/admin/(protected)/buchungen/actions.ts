"use server";

import type { BookingStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { markBookingPaid } from "@/lib/booking-service";
import { buildInvoiceData } from "@/lib/invoice";
import { renderInvoicePdf } from "@/lib/invoice-pdf";
import { sendBookingMail, sendInvoiceMail } from "@/lib/email";
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

type BookingDetailsPayload = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAddressLine1?: string | null;
  customerAddressLine2?: string | null;
  customerPostalCode?: string | null;
  customerCity?: string | null;
  customerCountry?: string | null;
  notes?: string | null;
};

export async function updateBookingDetails(payload: BookingDetailsPayload) {
  const admin = await getAdminFromSession();
  if (!admin) return { ok: false };
  if (!payload?.id) return { ok: false };

  await prisma.booking.update({
    where: { id: payload.id },
    data: {
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone || null,
      customerAddressLine1: payload.customerAddressLine1 || null,
      customerAddressLine2: payload.customerAddressLine2 || null,
      customerPostalCode: payload.customerPostalCode || null,
      customerCity: payload.customerCity || null,
      customerCountry: payload.customerCountry || null,
      notes: payload.notes || null,
    },
  });

  return { ok: true };
}

export async function resendBookingConfirmation(bookingId: string) {
  const admin = await getAdminFromSession();
  if (!admin) return { ok: false, error: "unauthorized" };
  if (!bookingId) return { ok: false, error: "missing" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { courseSession: { include: { course: true } } },
  });
  if (!booking) return { ok: false, error: "not_found" };

  let subject = "Bestätigung deiner Buchung";
  const lines: string[] = [
    `Hallo ${booking.customerName},`,
    "",
    "Vielen Dank für deine Buchung bei der Fliegenfischerschule Urs Müller.",
    "",
  ];

  if (booking.type === "COURSE" && booking.courseSession?.course) {
    subject = `Bestätigung: ${booking.courseSession.course.title}`;
    lines.push(`Kurs: ${booking.courseSession.course.title}`);
    lines.push(`Datum: ${booking.courseSession.date.toLocaleDateString("de-CH")}`);
    lines.push(`Zeit: ${booking.courseSession.startTime}–${booking.courseSession.endTime}`);
    lines.push(`Ort: ${booking.courseSession.location}`);
    if (booking.quantity) {
      lines.push(`Plätze: ${booking.quantity}`);
    }
    lines.push("");
    lines.push("Wir senden dir die letzten Details zum Treffpunkt und zur Ausrüstung rechtzeitig zu.");
  } else if (booking.type === "PRIVATE" || booking.type === "TASTER") {
    const lesson = booking.lessonType
      ? await prisma.lessonOffering.findUnique({ where: { type: booking.lessonType } })
      : null;
    subject = `Bestätigung: ${lesson?.title ?? "Privatlektion"}`;
    lines.push(`Leistung: ${lesson?.title ?? booking.type}`);
    if (booking.hours) {
      lines.push(`Dauer: ${booking.hours} Stunden`);
    }
    if (booking.quantity && booking.quantity > 1) {
      lines.push(`Teilnehmer: ${booking.quantity}`);
    }
    lines.push("");
    lines.push("Wir melden uns in Kürze, um den Termin abzustimmen.");
  } else if (booking.type === "VOUCHER") {
    subject = "Bestätigung: Gutschein";
    lines.push("Gutschein-Bestellung bestätigt.");
    lines.push("Wir senden dir den Gutschein per E-Mail.");
  }

  lines.push("");
  lines.push(`Betrag: CHF ${booking.amountCHF}`);
  lines.push("");
  lines.push("Bei Fragen antworte bitte auf diese E-Mail.");
  lines.push("");
  lines.push("Petri Heil");
  lines.push("Urs Müller");
  lines.push("Fliegenfischerschule Urs Müller");
  lines.push("Geroldswil / Limmat / Zürich");
  lines.push("fliegenfischer-schule.shop");
  lines.push("info@fliegenfischer-schule.shop");

  try {
    await sendBookingMail({
      to: booking.customerEmail,
      subject,
      lines,
    });
    return { ok: true };
  } catch (error) {
    console.error("booking confirmation resend failed", error);
    return { ok: false, error: "send_failed" };
  }
}

export async function deleteBooking(bookingId: string) {
  const admin = await getAdminFromSession();
  if (!admin) return { ok: false, error: "unauthorized" };
  if (!bookingId) return { ok: false, error: "missing" };

  await prisma.booking.delete({ where: { id: bookingId } });
  return { ok: true };
}
