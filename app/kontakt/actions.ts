"use server";

import { sendContactMail } from "@/lib/email";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const company = String(formData.get("company") || "").trim();

  if (company) {
    return { status: "success", message: "Danke! Wir melden uns bald." };
  }

  if (!name || !email || !message) {
    return {
      status: "error",
      message: "Bitte Name, E-Mail und Nachricht ausfuellen.",
    };
  }

  if (!emailRegex.test(email)) {
    return { status: "error", message: "Bitte eine gueltige E-Mail eingeben." };
  }

  try {
    await sendContactMail({ name, email, phone, subject, message });
    return {
      status: "success",
      message: "Danke! Wir melden uns innert 48 Stunden.",
    };
  } catch (error) {
    const fallback =
      "Versand derzeit nicht verfuegbar. Bitte telefonisch oder per Mail melden.";
    if (error instanceof Error && error.message.includes("Missing SMTP")) {
      return { status: "error", message: fallback };
    }
    return { status: "error", message: fallback };
  }
}
