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

export type InvoiceEmailPayload = {
  to: string;
  customerName: string;
  invoiceNumber: string;
  amountCHF: number;
  dueDate: Date;
  invoiceUrl?: string | null;
  pdfBytes: Uint8Array;
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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatMultiline = (value: string) =>
  escapeHtml(value).replace(/\n/g, "<br/>");

export async function sendContactMail(payload: ContactPayload) {
  const to =
    getEnv("CONTACT_EMAIL_TO") ||
    getEnv("SMTP_TO") ||
    "info@fliegenfischer-schule.shop";
  const from = getEnv("CONTACT_EMAIL_FROM") || getDefaultFrom();
  const transporter = createTransporter();

  const subject = payload.subject?.trim();
  const subjectLine = subject ? `Kontaktanfrage · ${subject}` : "Kontaktanfrage";
  const phoneLine = payload.phone ? payload.phone : "(nicht angegeben)";
  const text = [
    "Neue Kontaktanfrage über fliegenfischer-schule.shop",
    "",
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    `Telefon: ${phoneLine}`,
    subject ? `Betreff: ${subject}` : null,
    "",
    "Nachricht:",
    payload.message,
    "",
    "Hinweis: Reply-To ist auf die E-Mail des Absenders gesetzt.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="background:#f8f7f4;padding:24px;font-family:Arial,sans-serif;color:#1A202C;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
        <div style="background:#0F3231;color:#ffffff;padding:16px 20px;font-size:16px;font-weight:700;">
          Neue Kontaktanfrage
        </div>
        <div style="padding:20px 20px 16px;">
          <p style="margin:0 0 12px;font-size:14px;color:#4A5568;">
            Eingegangen über fliegenfischer-schule.shop
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#4A5568;width:140px;">Name</td>
              <td style="padding:6px 0;font-weight:600;">${escapeHtml(payload.name)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#4A5568;">E-Mail</td>
              <td style="padding:6px 0;">${escapeHtml(payload.email)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#4A5568;">Telefon</td>
              <td style="padding:6px 0;">${escapeHtml(phoneLine)}</td>
            </tr>
            ${
              subject
                ? `<tr>
                    <td style="padding:6px 0;color:#4A5568;">Betreff</td>
                    <td style="padding:6px 0;">${escapeHtml(subject)}</td>
                  </tr>`
                : ""
            }
          </table>
          <div style="margin:16px 0;border-top:1px solid #E5E7EB;"></div>
          <div style="font-size:13px;color:#4A5568;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">
            Nachricht
          </div>
          <div style="background:#F8F7F4;border-radius:10px;padding:12px 14px;font-size:14px;line-height:1.5;">
            ${formatMultiline(payload.message)}
          </div>
        </div>
        <div style="padding:14px 20px 20px;font-size:12px;color:#4A5568;">
          Reply-To ist auf die E-Mail des Absenders gesetzt.
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    to,
    from,
    replyTo: payload.email,
    subject: `${subjectLine} · ${payload.name}`,
    text,
    html,
  });
}

export async function sendContactConfirmationMail(payload: ContactPayload) {
  const to = payload.email;
  const from = getEnv("CONTACT_CONFIRMATION_FROM") || getDefaultFrom();
  const transporter = createTransporter();

  const subject = payload.subject?.trim();
  const phoneLine = payload.phone ? payload.phone : "(nicht angegeben)";
  const lines = [
    `Hallo ${payload.name},`,
    "",
    "Vielen Dank für deine Anfrage.",
    "Wir melden uns in der Regel innert 48 Stunden.",
    "",
    "Zusammenfassung:",
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    `Telefon: ${phoneLine}`,
    subject ? `Betreff: ${subject}` : null,
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

  const html = `
    <div style="background:#f8f7f4;padding:24px;font-family:Arial,sans-serif;color:#1A202C;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
        <div style="background:#0F3231;color:#ffffff;padding:16px 20px;font-size:16px;font-weight:700;">
          Bestätigung deiner Anfrage
        </div>
        <div style="padding:20px;">
          <p style="margin:0 0 10px;font-size:14px;">Hallo ${escapeHtml(
            payload.name
          )},</p>
          <p style="margin:0 0 12px;font-size:14px;color:#4A5568;">
            Vielen Dank für deine Anfrage. Wir melden uns in der Regel innert 48 Stunden.
          </p>
          <div style="margin:16px 0;border-top:1px solid #E5E7EB;"></div>
          <div style="font-size:13px;color:#4A5568;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">
            Zusammenfassung
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#4A5568;width:140px;">Name</td>
              <td style="padding:6px 0;font-weight:600;">${escapeHtml(
                payload.name
              )}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#4A5568;">E-Mail</td>
              <td style="padding:6px 0;">${escapeHtml(payload.email)}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#4A5568;">Telefon</td>
              <td style="padding:6px 0;">${escapeHtml(phoneLine)}</td>
            </tr>
            ${
              subject
                ? `<tr>
                    <td style="padding:6px 0;color:#4A5568;">Betreff</td>
                    <td style="padding:6px 0;">${escapeHtml(subject)}</td>
                  </tr>`
                : ""
            }
          </table>
          <div style="margin:16px 0;border-top:1px solid #E5E7EB;"></div>
          <div style="font-size:13px;color:#4A5568;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">
            Deine Nachricht
          </div>
          <div style="background:#F8F7F4;border-radius:10px;padding:12px 14px;font-size:14px;line-height:1.5;">
            ${formatMultiline(payload.message)}
          </div>
          <div style="margin-top:18px;font-size:13px;color:#4A5568;">
            <div>Petri Heil</div>
            <div style="font-weight:600;color:#1A202C;">Urs Müller</div>
            <div>Fliegenfischerschule Urs Müller</div>
            <div>Geroldswil / Limmat / Zürich</div>
            <div>fliegenfischer-schule.shop</div>
            <div>info@fliegenfischer-schule.shop</div>
          </div>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    to,
    from,
    replyTo: getReplyTo(),
    subject: "Bestätigung deiner Anfrage",
    text: lines,
    html,
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

export async function sendInvoiceMail(payload: InvoiceEmailPayload) {
  const from = getEnv("BOOKING_EMAIL_FROM") || getDefaultFrom();
  const bcc = getEnv("BOOKING_EMAIL_BCC") || "";
  const transporter = createTransporter();

  const dueDate = new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(payload.dueDate);

  const lines = [
    `Hallo ${payload.customerName},`,
    "",
    "Vielen Dank für deine Anfrage.",
    "Anbei findest du die Rechnung als PDF.",
    "",
    `Rechnung: ${payload.invoiceNumber}`,
    `Betrag: CHF ${payload.amountCHF}`,
    `Fällig bis: ${dueDate}`,
    "",
    "Anmeldung und Platzreservation sind erst nach Zahlungseingang gültig.",
    payload.invoiceUrl ? `Online-Link: ${payload.invoiceUrl}` : null,
    "",
    "Bei Fragen antworte bitte auf diese E-Mail.",
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

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; line-height: 1.5;">
      <h2 style="margin: 0 0 8px; color: #0f3231;">Rechnung ${payload.invoiceNumber}</h2>
      <p style="margin: 0 0 16px;">Hallo ${payload.customerName},</p>
      <p style="margin: 0 0 16px;">vielen Dank für deine Anfrage. Anbei findest du die Rechnung als PDF.</p>
      <table style="border-collapse: collapse; margin: 0 0 16px;">
        <tr>
          <td style="padding: 4px 16px 4px 0; color: #475569;">Rechnung</td>
          <td style="padding: 4px 0; font-weight: 600;">${payload.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 4px 16px 4px 0; color: #475569;">Betrag</td>
          <td style="padding: 4px 0; font-weight: 600;">CHF ${payload.amountCHF}</td>
        </tr>
        <tr>
          <td style="padding: 4px 16px 4px 0; color: #475569;">Fällig bis</td>
          <td style="padding: 4px 0; font-weight: 600;">${dueDate}</td>
        </tr>
      </table>
      <p style="margin: 0 0 20px; color: #475569;">
        Anmeldung und Platzreservation sind erst nach Zahlungseingang gültig.
      </p>
      ${
        payload.invoiceUrl
          ? `<p style="margin: 0 0 24px;">
              <a href="${payload.invoiceUrl}" style="display: inline-block; background: #E88648; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 999px; font-weight: 600;">
                Rechnung online ansehen
              </a>
            </p>`
          : ""
      }
      <p style="margin: 0 0 16px; color: #475569;">Bei Fragen antworte bitte auf diese E-Mail.</p>
      <p style="margin: 16px 0 0;">
        Petri Heil<br />
        Urs Müller<br />
        Fliegenfischerschule Urs Müller<br />
        Geroldswil / Limmat / Zürich<br />
        fliegenfischer-schule.shop<br />
        info@fliegenfischer-schule.shop
      </p>
    </div>
  `;

  await transporter.sendMail({
    to: payload.to,
    bcc: bcc || undefined,
    from,
    replyTo: getReplyTo(),
    subject: `Rechnung ${payload.invoiceNumber} – Fliegenfischerschule Urs Müller`,
    text: lines,
    html,
    attachments: [
      {
        filename: `Rechnung-${payload.invoiceNumber}.pdf`,
        content: Buffer.from(payload.pdfBytes),
      },
    ],
  });
}
