import { NextResponse } from "next/server";

import type { CheckoutPayload } from "@/lib/checkout";
import { createCheckoutBooking } from "@/lib/checkout";

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

    return NextResponse.json({ invoice: true, bookingId: result.booking.id });
  } catch (error) {
    console.error("checkout failed", error);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
