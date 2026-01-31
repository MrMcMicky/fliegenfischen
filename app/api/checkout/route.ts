import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { calculateLessonTotal, normalizePrice } from "@/lib/booking-utils";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as
      | {
          type?: "COURSE" | "PRIVATE" | "TASTER" | "VOUCHER";
          sessionId?: string;
          lessonType?: "PRIVATE" | "TASTER";
          voucherOptionId?: string;
          voucherAmount?: number;
          quantity?: number;
          hours?: number;
          additionalPeople?: number;
          customer?: { name?: string; email?: string; phone?: string };
          paymentMode?: "STRIPE" | "INVOICE";
          notes?: string;
          voucherRecipient?: string;
          voucherMessage?: string;
        }
      | null;

    if (!payload?.type || !payload.customer?.name || !payload.customer?.email) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const paymentMode = payload.paymentMode || "STRIPE";

    let amountCHF = 0;
    let bookingData: {
      type: "COURSE" | "PRIVATE" | "TASTER" | "VOUCHER";
      courseSessionId?: string;
      lessonType?: "PRIVATE" | "TASTER";
      voucherOptionId?: string;
      quantity?: number;
      hours?: number;
    } = {
      type: payload.type,
    };

    let productName = "Buchung";
    let productDescription = "";
    let lineItemQuantity = 1;
    let unitAmountCHF = 0;

    if (payload.type === "COURSE") {
      if (!payload.sessionId) {
        return NextResponse.json({ error: "missing_session" }, { status: 400 });
      }
      const session = await prisma.courseSession.findUnique({
        where: { id: payload.sessionId },
        include: { course: true },
      });
      if (!session || !session.course) {
        return NextResponse.json({ error: "session_not_found" }, { status: 404 });
      }
      const quantityInput = Number(payload.quantity ?? 1);
      const quantity = Number.isFinite(quantityInput)
        ? Math.max(1, quantityInput)
        : 1;
      if (quantity > session.availableSpots) {
        return NextResponse.json({ error: "not_enough_spots" }, { status: 400 });
      }
      amountCHF = session.priceCHF * quantity;
      bookingData = {
        ...bookingData,
        courseSessionId: session.id,
        quantity,
      };
      productName = `${session.course.title}`;
      productDescription = `${session.startTime}-${session.endTime} · ${session.location}`;
      lineItemQuantity = quantity;
      unitAmountCHF = session.priceCHF;
    }

    if (payload.type === "PRIVATE" || payload.type === "TASTER") {
      const lessonType = payload.lessonType || payload.type;
      const lesson = await prisma.lessonOffering.findUnique({
        where: { type: lessonType },
      });
      if (!lesson) {
        return NextResponse.json({ error: "lesson_not_found" }, { status: 404 });
      }
      const hoursInput = Number(payload.hours ?? lesson.minHours);
      const hours = Number.isFinite(hoursInput)
        ? Math.max(lesson.minHours, hoursInput)
        : lesson.minHours;
      const additionalInput = Number(payload.additionalPeople ?? 0);
      const additionalPeople = Number.isFinite(additionalInput)
        ? Math.max(0, additionalInput)
        : 0;
      amountCHF = calculateLessonTotal(
        lesson.priceCHF,
        hours,
        lesson.additionalPersonCHF,
        additionalPeople
      );
      bookingData = {
        ...bookingData,
        lessonType,
        quantity: 1 + additionalPeople,
        hours,
      };
      productName = lesson.title;
      productDescription = `${hours} Stunden · ${additionalPeople} Zusatzpersonen`;
      lineItemQuantity = 1;
      unitAmountCHF = amountCHF;
    }

    if (payload.type === "VOUCHER") {
      if (!payload.voucherOptionId) {
        return NextResponse.json({ error: "missing_voucher" }, { status: 400 });
      }
      const option = await prisma.voucherOption.findUnique({
        where: { id: payload.voucherOptionId },
      });
      if (!option) {
        return NextResponse.json({ error: "voucher_not_found" }, { status: 404 });
      }
      if (!payload.voucherAmount || !option.values.includes(payload.voucherAmount)) {
        return NextResponse.json({ error: "invalid_voucher_amount" }, { status: 400 });
      }
      amountCHF = normalizePrice(payload.voucherAmount);
      bookingData = {
        ...bookingData,
        voucherOptionId: option.id,
      };
      productName = option.title;
      productDescription = `Gutschein ${amountCHF} CHF`;
      lineItemQuantity = 1;
      unitAmountCHF = amountCHF;
    }

    if (amountCHF <= 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        type: bookingData.type,
        courseSessionId: bookingData.courseSessionId,
        lessonType: bookingData.lessonType,
        voucherOptionId: bookingData.voucherOptionId,
        customerName: payload.customer.name,
        customerEmail: payload.customer.email,
        customerPhone: payload.customer.phone || null,
        quantity: bookingData.quantity,
        hours: bookingData.hours,
        amountCHF,
        currency: "chf",
        paymentMode,
        status: paymentMode === "INVOICE" ? "INVOICE_REQUESTED" : "PAYMENT_PENDING",
        notes: payload.notes || null,
        voucherRecipient: payload.voucherRecipient || null,
        voucherMessage: payload.voucherMessage || null,
      },
    });

    if (paymentMode === "INVOICE") {
      return NextResponse.json({ invoice: true, bookingId: booking.id });
    }

    if (!env.stripeSecretKey) {
      return NextResponse.json({ error: "missing_stripe" }, { status: 500 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["twint", "card"],
      success_url: `${env.appUrl}/checkout/erfolg?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.appUrl}/checkout/cancel?bookingId=${booking.id}`,
      metadata: {
        bookingId: booking.id,
        bookingType: booking.type,
      },
      line_items: [
        {
          price_data: {
            currency: "chf",
            unit_amount: Math.round(unitAmountCHF * 100),
            product_data: {
              name: productName,
              description: productDescription,
            },
          },
          quantity: lineItemQuantity,
        },
      ],
    });

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        status: "PENDING",
        stripeCheckoutSessionId: session.id,
      },
      update: {
        status: "PENDING",
        stripeCheckoutSessionId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("checkout failed", error);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
