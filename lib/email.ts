import nodemailer from "nodemailer";

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

export type VoucherEmailPayload = {
  to: string;
  customerName: string;
  voucherCode: string;
  amountCHF: number;
  recipientName?: string | null;
  message?: string | null;
  pdfBytes: Uint8Array;
};

export type BookingEmailPayload = {
  to: string;
  subject: string;
  lines: string[];
};

const getEnv = (key: string) => process.env[key];

const createTransporter = () => {
  const host = getEnv("SMTP_HOST");
  const portValue = getEnv("SMTP_PORT");
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const secure = getEnv("SMTP_SECURE") === "true";

  if (!host || !portValue || !user || !pass) {
    throw new Error(
      "Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS."
    );
  }

  const port = Number(portValue);
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const getDefaultFrom = () =>
  getEnv("SMTP_FROM") || "Fliegenfischerschule <no-reply@fliegenfischer-schule.shop>";

export async function sendContactMail(payload: ContactPayload) {
  const to =
    getEnv("CONTACT_EMAIL_TO") ||
    getEnv("SMTP_TO") ||
    "info@fliegenfischer-schule.ch";
  const from = getEnv("CONTACT_EMAIL_FROM") || getDefaultFrom();
  const transporter = createTransporter();

  const subject = payload.subject?.trim() || "Kontaktanfrage";
  const text = [
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    payload.phone ? `Telefon: ${payload.phone}` : null,
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    to,
    from,
    replyTo: payload.email,
    subject: `Fliegenfischerschule: ${subject}`,
    text,
  });
}

export async function sendVoucherMail(payload: VoucherEmailPayload) {
  const from = getEnv("BOOKING_EMAIL_FROM") || getDefaultFrom();
  const bcc = getEnv("BOOKING_EMAIL_BCC") || "";
  const transporter = createTransporter();

  const subject = "Dein Gutschein der Fliegenfischerschule";
  const lines = [
    `Hallo ${payload.customerName},`,
    "",
    "Vielen Dank für deine Bestellung.",
    `Gutschein-Code: ${payload.voucherCode}`,
    `Wert: CHF ${payload.amountCHF}`,
    payload.recipientName ? `Empfänger: ${payload.recipientName}` : null,
    "",
    payload.message ? `Nachricht: ${payload.message}` : null,
    "",
    "Der Gutschein ist als PDF im Anhang.",
    "",
    "Petri Heil",
    "Fliegenfischerschule Urs Müller",
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    to: payload.to,
    bcc: bcc || undefined,
    from,
    subject,
    text: lines,
    attachments: [
      {
        filename: `Gutschein-${payload.voucherCode}.pdf`,
        content: Buffer.from(payload.pdfBytes),
      },
    ],
  });
}

export async function sendBookingMail(payload: BookingEmailPayload) {
  const from = getEnv("BOOKING_EMAIL_FROM") || getDefaultFrom();
  const bcc = getEnv("BOOKING_EMAIL_BCC") || "";
  const transporter = createTransporter();

  await transporter.sendMail({
    to: payload.to,
    bcc: bcc || undefined,
    from,
    subject: payload.subject,
    text: payload.lines.join("\n"),
  });
}
