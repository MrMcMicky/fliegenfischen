import nodemailer from "nodemailer";

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

const getEnv = (key: string) => process.env[key];

export async function sendContactMail(payload: ContactPayload) {
  const host = getEnv("SMTP_HOST");
  const portValue = getEnv("SMTP_PORT");
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const secure = getEnv("SMTP_SECURE") === "true";
  const to =
    getEnv("CONTACT_EMAIL_TO") ||
    getEnv("SMTP_TO") ||
    "info@fliegenfischer-schule.ch";
  const from =
    getEnv("CONTACT_EMAIL_FROM") ||
    getEnv("SMTP_FROM") ||
    "Fliegenfischerschule <no-reply@fliegenfischer-schule.shop>";

  if (!host || !portValue || !user || !pass) {
    throw new Error(
      "Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS."
    );
  }

  const port = Number(portValue);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

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
