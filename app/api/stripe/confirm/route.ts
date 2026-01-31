import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { markBookingPaid } from "@/lib/booking-service";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as
      | { bookingId?: string }
      | null;

    if (!payload?.bookingId) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: payload.bookingId },
      include: { payment: true, voucher: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "booking_not_found" }, { status: 404 });
    }

    if (booking.status === "PAID" && booking.payment?.status === "PAID") {
      return NextResponse.json({
        ok: true,
        status: "paid",
        voucherCode: booking.voucher?.code ?? null,
      });
    }

    const sessionId = booking.payment?.stripeCheckoutSessionId;
    if (!sessionId) {
      return NextResponse.json({ error: "missing_session" }, { status: 400 });
    }

    if (!env.stripeSecretKey) {
      return NextResponse.json({ error: "missing_stripe" }, { status: 500 });
    }
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;
    const paid =
      session.payment_status === "paid" || paymentIntent?.status === "succeeded";

    if (!paid) {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    const result = await markBookingPaid({
      bookingId: booking.id,
      sessionId: session.id,
      paymentIntentId: paymentIntent?.id ?? null,
    });

    return NextResponse.json({
      ok: true,
      status: "paid",
      voucherCode: result?.voucher?.code ?? null,
    });
  } catch (error) {
    console.error("stripe confirm failed", error);
    return NextResponse.json({ error: "confirm_failed" }, { status: 500 });
  }
}
