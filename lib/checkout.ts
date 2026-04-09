import type { Booking, PaymentMode, VoucherDeliveryMethod } from "@prisma/client";

import { prisma } from "@/lib/db";
import { calculateLessonTotal, normalizePrice } from "@/lib/booking-utils";
import { VOUCHER_PRINT_SURCHARGE_CHF } from "@/lib/vouchers";

export type CheckoutPayload = {
  type?: "COURSE" | "PRIVATE" | "TASTER" | "VOUCHER";
  sessionId?: string;
  lessonType?: "PRIVATE" | "TASTER";
  voucherOptionId?: string;
  voucherAmount?: number;
  quantity?: number;
  hours?: number;
  additionalPeople?: number;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  paymentMode?: "STRIPE" | "INVOICE";
  notes?: string;
  voucherDeliveryMethod?: "EMAIL" | "POSTAL";
  voucherRecipient?: string;
  voucherMessage?: string;
};

type CheckoutError = {
  ok: false;
  error: string;
  status: number;
};

type CheckoutSuccess = {
  ok: true;
  booking: Booking;
  amountCHF: number;
  productName: string;
  productDescription: string;
  lineItemQuantity: number;
  unitAmountCHF: number;
};

export const createCheckoutBooking = async (
  payload: CheckoutPayload | null,
  paymentMode: PaymentMode
): Promise<CheckoutError | CheckoutSuccess> => {
  if (!payload?.type || !payload.customer?.name || !payload.customer?.email) {
    return { ok: false, error: "missing_fields", status: 400 };
  }

  let amountCHF = 0;
  let bookingData: {
    type: "COURSE" | "PRIVATE" | "TASTER" | "VOUCHER";
    courseSessionId?: string;
    lessonType?: "PRIVATE" | "TASTER";
    voucherOptionId?: string;
    quantity?: number;
    hours?: number;
    voucherValueCHF?: number;
    voucherShippingCHF?: number;
    voucherDeliveryMethod?: VoucherDeliveryMethod;
  } = {
    type: payload.type,
  };

  let productName = "Buchung";
  let productDescription = "";
  let lineItemQuantity = 1;
  let unitAmountCHF = 0;

  if (payload.type === "COURSE") {
    if (!payload.sessionId) {
      return { ok: false, error: "missing_session", status: 400 };
    }
    const session = await prisma.courseSession.findUnique({
      where: { id: payload.sessionId },
      include: { course: true },
    });
    if (!session || !session.course) {
      return { ok: false, error: "session_not_found", status: 404 };
    }
    const quantityInput = Number(payload.quantity ?? 1);
    const quantity = Number.isFinite(quantityInput)
      ? Math.max(1, quantityInput)
      : 1;
    if (quantity > session.availableSpots) {
      return { ok: false, error: "not_enough_spots", status: 400 };
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
      return { ok: false, error: "lesson_not_found", status: 404 };
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
      return { ok: false, error: "missing_voucher", status: 400 };
    }
    const option = await prisma.voucherOption.findUnique({
      where: { id: payload.voucherOptionId },
    });
    if (!option) {
      return { ok: false, error: "voucher_not_found", status: 404 };
    }
    if (!payload.voucherAmount || !option.values.includes(payload.voucherAmount)) {
      return { ok: false, error: "invalid_voucher_amount", status: 400 };
    }
    const voucherValueCHF = normalizePrice(payload.voucherAmount);
    const voucherDeliveryMethod = payload.voucherDeliveryMethod || "EMAIL";
    const voucherShippingCHF =
      voucherDeliveryMethod === "POSTAL" ? VOUCHER_PRINT_SURCHARGE_CHF : 0;

    if (voucherDeliveryMethod === "POSTAL") {
      const hasAddress =
        payload.customer.addressLine1?.trim() &&
        payload.customer.postalCode?.trim() &&
        payload.customer.city?.trim();
      if (!hasAddress) {
        return { ok: false, error: "missing_postal_address", status: 400 };
      }
    }

    amountCHF = voucherValueCHF + voucherShippingCHF;
    bookingData = {
      ...bookingData,
      voucherOptionId: option.id,
      voucherValueCHF,
      voucherShippingCHF,
      voucherDeliveryMethod,
    };
    productName = option.title;
    productDescription =
      voucherShippingCHF > 0
        ? `Gutschein CHF ${voucherValueCHF} · Druck & Versand + CHF ${voucherShippingCHF}`
        : `Gutschein CHF ${voucherValueCHF}`;
    lineItemQuantity = 1;
    unitAmountCHF = amountCHF;
  }

  if (amountCHF <= 0) {
    return { ok: false, error: "invalid_amount", status: 400 };
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
      customerAddressLine1: payload.customer.addressLine1?.trim() || null,
      customerAddressLine2: payload.customer.addressLine2?.trim() || null,
      customerPostalCode: payload.customer.postalCode?.trim() || null,
      customerCity: payload.customer.city?.trim() || null,
      customerCountry: payload.customer.country?.trim() || null,
      quantity: bookingData.quantity,
      hours: bookingData.hours,
      amountCHF,
      currency: "chf",
      paymentMode,
      status: paymentMode === "INVOICE" ? "INVOICE_REQUESTED" : "PAYMENT_PENDING",
      notes: payload.notes || null,
      voucherValueCHF: bookingData.voucherValueCHF,
      voucherShippingCHF: bookingData.voucherShippingCHF,
      voucherDeliveryMethod: bookingData.voucherDeliveryMethod,
      voucherRecipient: payload.voucherRecipient || null,
      voucherMessage: payload.voucherMessage || null,
    },
  });

  return {
    ok: true,
    booking,
    amountCHF,
    productName,
    productDescription,
    lineItemQuantity,
    unitAmountCHF,
  };
};
