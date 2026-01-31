import crypto from "crypto";
import type { Booking } from "@prisma/client";

import { prisma } from "@/lib/db";
import { sendBookingMail, sendVoucherMail } from "@/lib/email";
import { renderVoucherPdf } from "@/lib/voucher-pdf";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateVoucherCode = (length = 10) => {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
};

const createVoucherIfNeeded = async (booking: Booking) => {
  if (booking.type !== "VOUCHER") return null;
  const existing = await prisma.voucher.findFirst({
    where: { bookingId: booking.id },
  });
  if (existing) return existing;

  let code = generateVoucherCode();
  let attempts = 0;
  while (attempts < 5) {
    const match = await prisma.voucher.findUnique({ where: { code } });
    if (!match) break;
    code = generateVoucherCode();
    attempts += 1;
  }

  return prisma.voucher.create({
    data: {
      code,
      originalAmount: booking.amountCHF,
      remainingAmount: booking.amountCHF,
      bookingId: booking.id,
      recipientName: booking.voucherRecipient || null,
      message: booking.voucherMessage || null,
    },
  });
};

export const markBookingPaid = async ({
  bookingId,
  sessionId,
  paymentIntentId,
}: {
  bookingId: string;
  sessionId?: string | null;
  paymentIntentId?: string | null;
}) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, voucher: true },
  });
  if (!booking) return null;

  const alreadyPaid =
    booking.status === "PAID" && booking.payment?.status === "PAID";

  if (!alreadyPaid) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "PAID" },
    });

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        status: "PAID",
        stripeCheckoutSessionId: sessionId ?? booking.payment?.stripeCheckoutSessionId ?? null,
        stripePaymentIntentId: paymentIntentId ?? null,
        paidAt: new Date(),
      },
      update: {
        status: "PAID",
        stripeCheckoutSessionId: sessionId ?? booking.payment?.stripeCheckoutSessionId ?? null,
        stripePaymentIntentId: paymentIntentId ?? booking.payment?.stripePaymentIntentId ?? null,
        paidAt: booking.payment?.paidAt ?? new Date(),
      },
    });

    if (booking.type === "COURSE" && booking.courseSessionId && booking.quantity) {
      await prisma.courseSession.update({
        where: { id: booking.courseSessionId },
        data: {
          availableSpots: {
            decrement: booking.quantity,
          },
        },
      });
    }
  }

  const voucher = await createVoucherIfNeeded(booking);

  if (!alreadyPaid && booking.type === "VOUCHER" && voucher) {
    try {
      const pdfBytes = await renderVoucherPdf({
        code: voucher.code,
        amountCHF: voucher.originalAmount,
        recipientName: voucher.recipientName,
        message: voucher.message,
        purchaserName: booking.customerName,
        issuedAt: new Date(),
      });
      await sendVoucherMail({
        to: booking.customerEmail,
        customerName: booking.customerName,
        voucherCode: voucher.code,
        amountCHF: voucher.originalAmount,
        recipientName: voucher.recipientName,
        message: voucher.message,
        pdfBytes,
      });
    } catch (error) {
      console.error("voucher email failed", error);
    }
  }

  if (!alreadyPaid && booking.type !== "VOUCHER") {
    try {
      let subject = "Bestätigung deiner Buchung";
      const lines: string[] = [
        `Hallo ${booking.customerName},`,
        "",
        "Vielen Dank für deine Buchung bei der Fliegenfischerschule Urs Müller.",
        "",
      ];

      if (booking.type === "COURSE" && booking.courseSessionId) {
        const session = await prisma.courseSession.findUnique({
          where: { id: booking.courseSessionId },
          include: { course: true },
        });
        if (session?.course) {
          subject = `Bestätigung: ${session.course.title}`;
          lines.push(`Kurs: ${session.course.title}`);
          lines.push(`Datum: ${session.date.toLocaleDateString("de-CH")}`);
          lines.push(`Zeit: ${session.startTime}–${session.endTime}`);
          lines.push(`Ort: ${session.location}`);
          if (booking.quantity) {
            lines.push(`Plätze: ${booking.quantity}`);
          }
          lines.push("");
          lines.push("Wir senden dir die letzten Details zum Treffpunkt und zur Ausrüstung rechtzeitig zu.");
        }
      }

      if (booking.type === "PRIVATE" || booking.type === "TASTER") {
        const lesson = booking.lessonType
          ? await prisma.lessonOffering.findUnique({
              where: { type: booking.lessonType },
            })
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

      await sendBookingMail({
        to: booking.customerEmail,
        subject,
        lines,
      });
    } catch (error) {
      console.error("booking email failed", error);
    }
  }

  return { booking, voucher };
};
