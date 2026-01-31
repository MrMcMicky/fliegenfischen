import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { markBookingPaid } from "@/lib/booking-service";

export async function POST(request: Request) {
  if (!env.stripeWebhookSecret) {
    return NextResponse.json({ error: "missing_webhook_secret" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.stripeWebhookSecret
    );
  } catch (error) {
    console.error("stripe webhook signature failed", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const existing = await prisma.stripeEvent.findUnique({
    where: { id: event.id },
  });
  if (existing) {
    return NextResponse.json({ received: true });
  }

  await prisma.stripeEvent.create({
    data: {
      id: event.id,
      type: event.type,
    },
  });

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      return NextResponse.json({ received: true });
    }

    await markBookingPaid({
      bookingId,
      sessionId: session.id,
      paymentIntentId: (session.payment_intent as string) || null,
    });
  }

  return NextResponse.json({ received: true });
}
