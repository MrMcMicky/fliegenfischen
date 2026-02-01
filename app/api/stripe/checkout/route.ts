import { NextResponse } from "next/server";

import type { CheckoutPayload } from "@/lib/checkout";
import { createCheckoutBooking } from "@/lib/checkout";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as CheckoutPayload | null;

    if (!env.stripeSecretKey) {
      return NextResponse.json({ error: "missing_stripe" }, { status: 500 });
    }

    if (!payload) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    if (payload?.paymentMode === "INVOICE") {
      return NextResponse.json({ error: "use_invoice_checkout" }, { status: 400 });
    }

    const result = await createCheckoutBooking(payload, "STRIPE");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const stripe = getStripe();
    const customerEmail = payload.customer?.email?.trim() || undefined;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["twint", "card"],
      customer_email: customerEmail,
      success_url: `${env.appUrl}/checkout/erfolg?bookingId=${result.booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.appUrl}/checkout/cancel?bookingId=${result.booking.id}`,
      metadata: {
        bookingId: result.booking.id,
        bookingType: result.booking.type,
      },
      line_items: [
        {
          price_data: {
            currency: "chf",
            unit_amount: Math.round(result.unitAmountCHF * 100),
            product_data: {
              name: result.productName,
              description: result.productDescription,
            },
          },
          quantity: result.lineItemQuantity,
        },
      ],
    });

    await prisma.payment.upsert({
      where: { bookingId: result.booking.id },
      create: {
        bookingId: result.booking.id,
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
    console.error("stripe checkout failed", error);
    return NextResponse.json({ error: "stripe_checkout_failed" }, { status: 500 });
  }
}
