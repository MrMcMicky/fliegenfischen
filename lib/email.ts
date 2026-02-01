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
  getEnv("SMTP_FROM") || "Urs Müller <info@fliegenfischer-schule.shop>";

const getReplyTo = () =>
  getEnv("SMTP_REPLY_TO") ||
  getEnv("CONTACT_EMAIL_TO") ||
  "info@fliegenfischer-schule.shop";

export async function sendContactMail(payload: ContactPayload) {
  const to =
    getEnv("CONTACT_EMAIL_TO") ||
    getEnv("SMTP_TO") ||
    "info@fliegenfischer-schule.shop";
  const from = getEnv("CONTACT_EMAIL_FROM") || getDefaultFrom();
  const transporter = createTransporter();

  const subject = payload.subject?.trim();
  const subjectLine = subject ? `Kontaktanfrage · ${subject}` : "Kontaktanfrage";
  const text = [
    "Neue Kontaktanfrage über fliegenfischer-schule.shop",
    "",
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    payload.phone ? `Telefon: ${payload.phone}` : "Telefon: (nicht angegeben)",
    subject ? `Betreff: ${subject}` : null,
    "",
    "Nachricht:",
    payload.message,
    "",
    "Hinweis: Reply-To ist auf die E-Mail des Absenders gesetzt.",
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    to,
    from,
    replyTo: payload.email,
    subject: `${subjectLine} · ${payload.name}`,
    text,
  });
}

export async function sendContactConfirmationMail(payload: ContactPayload) {
  const to = payload.email;
  const from = getEnv("CONTACT_CONFIRMATION_FROM") || getDefaultFrom();
  const transporter = createTransporter();

  const lines = [
    `Hallo ${payload.name},`,
    "",
    "Vielen Dank für deine Anfrage.",
    "Wir melden uns in der Regel innert 48 Stunden.",
    "",
    "Zusammenfassung:",
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    payload.phone ? `Telefon: ${payload.phone}` : "Telefon: (nicht angegeben)",
    payload.subject ? `Betreff: ${payload.subject}` : null,
    "",
    "Deine Nachricht:",
    payload.message,
    "",
    "Petri Heil",
    "Urs Müller",
    "Fliegenfischerschule Urs Müller",
    "Geroldswil / Limmat / Zürich",
    "fliegenfischer-schule.shop",
    "info@fliegenfischer-schule.shop",
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    to,
    from,
    replyTo: getReplyTo(),
    subject: "Bestätigung deiner Anfrage",
    text: lines,
  });
}

export async function sendVoucherMail(payload: VoucherEmailPayload) {
  const from = getEnv("BOOKING_EMAIL_FROM") || getDefaultFrom();
  const bcc = getEnv("BOOKING_EMAIL_BCC") || "";
  const transporter = createTransporter();

  const subject = "Dein Gutschein – Fliegenfischerschule Urs Müller";
  const lines = [
    `Hallo ${payload.customerName},`,
    "",
    "Vielen Dank für deine Bestellung.",
    "",
    `Gutschein-Code: ${payload.voucherCode}`,
    `Wert: CHF ${payload.amountCHF}`,
    payload.recipientName ? `Empfänger: ${payload.recipientName}` : null,
    "",
    payload.message ? `Nachricht: ${payload.message}` : null,
    "",
    "Der Gutschein ist als PDF im Anhang.",
    "Einlösbar für Kurse und Privatunterricht. Keine Barauszahlung.",
    "Termin nach Vereinbarung.",
    "",
    "Petri Heil",
    "Urs Müller",
    "Fliegenfischerschule Urs Müller",
    "Geroldswil / Limmat / Zürich",
    "fliegenfischer-schule.shop",
    "info@fliegenfischer-schule.shop",
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    to: payload.to,
    bcc: bcc || undefined,
    from,
    replyTo: getReplyTo(),
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
    replyTo: getReplyTo(),
    subject: payload.subject,
    text: payload.lines.join("\n"),
  });
}
