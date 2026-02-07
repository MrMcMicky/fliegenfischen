import { prisma } from "@/lib/db";

export type InvoiceLine = {
  description: string;
  quantity: number;
  unitPriceCHF: number;
  totalCHF: number;
};

export type InvoiceParty = {
  name: string;
  addressLines: string[];
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
};

export type InvoiceData = {
  invoiceNumber: string;
  issuedAt: Date;
  dueDate: Date;
  customer: InvoiceParty;
  seller: InvoiceParty;
  items: InvoiceLine[];
  totalCHF: number;
  notes: string[];
  paymentDetails: string[];
  bookingId: string;
};

const formatInvoiceNumber = (bookingId: string) =>
  `INV-${bookingId.slice(-6).toUpperCase()}`;

const getEnvLines = (key: string) => {
  const raw = process.env[key] || "";
  const normalized = raw
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n");
  return normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const getPaymentDetails = () => getEnvLines("INVOICE_PAYMENT_DETAILS");

const getSellerOverride = () => {
  const name = process.env.INVOICE_SELLER_NAME?.trim();
  const addressLines = getEnvLines("INVOICE_SELLER_ADDRESS");
  const email = process.env.INVOICE_SELLER_EMAIL?.trim();
  const phone = process.env.INVOICE_SELLER_PHONE?.trim();
  const mobile = process.env.INVOICE_SELLER_MOBILE?.trim();
  if (!name && addressLines.length === 0 && !email && !phone && !mobile) {
    return null;
  }
  return {
    name,
    addressLines,
    email,
    phone,
    mobile,
  };
};

const getDueDays = () => {
  const raw = process.env.INVOICE_DUE_DAYS;
  const parsed = raw ? Number(raw) : 10;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
};

export async function buildInvoiceData(bookingId: string): Promise<InvoiceData | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      courseSession: { include: { course: true } },
      voucherOption: true,
    },
  });

  if (!booking || booking.paymentMode !== "INVOICE") {
    return null;
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const contact = (settings?.contact as {
    instructor?: string;
    address?: string[];
    phone?: string;
    mobile?: string;
    email?: string;
  }) || {
    instructor: "Fliegenfischerschule Urs Müller",
    address: ["", ""],
    phone: "",
    mobile: "",
    email: "info@fliegenfischer-schule.shop",
  };

  const sellerOverride = getSellerOverride();
  const fallbackName =
    contact.instructor || settings?.name || "Fliegenfischerschule Urs Müller";
  const seller: InvoiceParty = {
    name: sellerOverride?.name || fallbackName,
    addressLines:
      sellerOverride?.addressLines?.length
        ? sellerOverride.addressLines
        : contact.address || [],
    email:
      sellerOverride?.email ||
      contact.email ||
      "info@fliegenfischer-schule.shop",
    phone:
      sellerOverride?.phone ||
      contact.phone ||
      sellerOverride?.mobile ||
      contact.mobile ||
      null,
    mobile: sellerOverride?.mobile || contact.mobile || null,
  };

  const customerAddressLines: string[] = [];
  if (booking.customerAddressLine1) {
    customerAddressLines.push(booking.customerAddressLine1);
  }
  if (booking.customerAddressLine2) {
    customerAddressLines.push(booking.customerAddressLine2);
  }
  const cityLine = [booking.customerPostalCode, booking.customerCity]
    .filter(Boolean)
    .join(" ");
  if (cityLine) {
    customerAddressLines.push(cityLine);
  }
  if (booking.customerCountry) {
    customerAddressLines.push(booking.customerCountry);
  }
  const customer: InvoiceParty = {
    name: booking.customerName,
    addressLines: customerAddressLines,
    email: booking.customerEmail,
    phone: booking.customerPhone || null,
  };

  const items: InvoiceLine[] = [];

  if (booking.type === "COURSE" && booking.courseSession) {
    const session = booking.courseSession;
    const title = session.course?.title || "Kurs";
    const description = `${title} · ${session.date.toLocaleDateString("de-CH")} · ${session.startTime}-${session.endTime} · ${session.location}`;
    const quantity = booking.quantity || 1;
    const unitPriceCHF = session.priceCHF;
    items.push({
      description,
      quantity,
      unitPriceCHF,
      totalCHF: unitPriceCHF * quantity,
    });
  }

  if (booking.type === "PRIVATE" || booking.type === "TASTER") {
    const lesson = booking.lessonType
      ? await prisma.lessonOffering.findUnique({ where: { type: booking.lessonType } })
      : null;
    const title = lesson?.title || (booking.type === "PRIVATE" ? "Privatlektion" : "Schnupperstunde");
    const hours = booking.hours ? `${booking.hours} Stunden` : "";
    const people = booking.quantity ? `${booking.quantity} Teilnehmende` : "";
    const detailBits = [hours, people].filter(Boolean).join(" · ");
    const description = detailBits ? `${title} · ${detailBits}` : title;
    items.push({
      description,
      quantity: 1,
      unitPriceCHF: booking.amountCHF,
      totalCHF: booking.amountCHF,
    });
  }

  if (booking.type === "VOUCHER") {
    const title = booking.voucherOption?.title || "Gutschein";
    const description = `${title} · Gutscheinwert CHF ${booking.amountCHF}`;
    items.push({
      description,
      quantity: 1,
      unitPriceCHF: booking.amountCHF,
      totalCHF: booking.amountCHF,
    });
  }

  const issuedAt = booking.createdAt;
  const dueDays = getDueDays();
  const dueDate = new Date(issuedAt.getTime() + dueDays * 24 * 60 * 60 * 1000);

  const notes = [
    "Anmeldung und Platzreservation sind erst nach Zahlungseingang gültig.",
  ];

  const paymentDetails = getPaymentDetails();

  return {
    invoiceNumber: formatInvoiceNumber(booking.id),
    issuedAt,
    dueDate,
    customer,
    seller,
    items,
    totalCHF: booking.amountCHF,
    notes,
    paymentDetails,
    bookingId: booking.id,
  };
}
