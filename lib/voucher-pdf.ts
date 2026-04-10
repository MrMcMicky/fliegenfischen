import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

import { buildVoucherVerificationUrl } from "@/lib/vouchers";

export type VoucherPdfInput = {
  code: string;
  amountCHF: number;
  voucherTitle?: string | null;
  recipientName?: string | null;
  message?: string | null;
  purchaserName?: string | null;
  issuedAt?: Date;
};

const A5_LANDSCAPE: [number, number] = [595.28, 419.53];
const TEMPLATE_PATHS = [
  path.join(process.cwd(), "screenshots", "Gutschein-Muster-leer-A5.jpg"),
  path.join(process.cwd(), "docs", "screenshots", "Gutschein-A5-Hintergrund.png"),
  path.join(process.cwd(), "docs", "screenshots", "gutschein-a5-hintergrund.png"),
  path.join(process.cwd(), "public", "branding", "Gutschein-A5-Hintergrund.png"),
  path.join(process.cwd(), "public", "branding", "gutschein-a5-hintergrund.png"),
];

const COLORS = {
  forest: rgb(15 / 255, 50 / 255, 49 / 255),
  forestSoft: rgb(20 / 255, 70 / 255, 68 / 255),
  ember: rgb(196 / 255, 56 / 255, 46 / 255),
  stone: rgb(248 / 255, 247 / 255, 244 / 255),
  mist: rgb(255 / 255, 255 / 255, 255 / 255),
  muted: rgb(82 / 255, 92 / 255, 104 / 255),
  line: rgb(221 / 255, 226 / 255, 232 / 255),
};

const formatCHF = (amount: number) =>
  new Intl.NumberFormat("de-CH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);

const wrapText = (
  text: string,
  maxWidth: number,
  font: { widthOfTextAtSize: (value: string, size: number) => number },
  fontSize: number
) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(nextLine, fontSize) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = nextLine;
    }
  }

  if (line) lines.push(line);
  return lines;
};

const limitLines = (lines: string[], maxLines: number) => {
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  const lastLine = visible[maxLines - 1] || "";
  visible[maxLines - 1] = `${lastLine.slice(0, Math.max(0, lastLine.length - 3))}...`;
  return visible;
};

const loadTemplate = async () => {
  for (const candidate of TEMPLATE_PATHS) {
    try {
      return {
        bytes: await fs.readFile(candidate),
        extension: path.extname(candidate).toLowerCase(),
      };
    } catch {
      // Try next path.
    }
  }

  return null;
};

const createQrPngBytes = async (value: string) => {
  const dataUrl = await QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: {
      dark: "#0f3231",
      light: "#ffffff",
    },
  });

  return Buffer.from(dataUrl.split(",")[1], "base64");
};

const drawFallbackBackground = (page: PDFPage, width: number, height: number) => {
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: COLORS.stone,
  });

  page.drawRectangle({
    x: 0,
    y: height - 110,
    width,
    height: 110,
    color: COLORS.forest,
  });

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 54,
    color: COLORS.forest,
  });

  page.drawRectangle({
    x: 0,
    y: 54,
    width,
    height: height - 164,
    color: rgb(214 / 255, 228 / 255, 234 / 255),
  });

  page.drawRectangle({
    x: 0,
    y: 54,
    width,
    height: 92,
    color: rgb(231 / 255, 238 / 255, 243 / 255),
    opacity: 0.65,
  });
};

export async function renderVoucherPdf(input: VoucherPdfInput) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(A5_LANDSCAPE);
  const { width, height } = page.getSize();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSerifItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const issuedDate = input.issuedAt ? formatDate(input.issuedAt) : formatDate(new Date());
  const recipient = input.recipientName?.trim();
  const purchaser = input.purchaserName?.trim();
  const verificationUrl = buildVoucherVerificationUrl(input.code);
  const template = await loadTemplate();

  if (template) {
    const templateImage =
      template.extension === ".jpg" || template.extension === ".jpeg"
        ? await pdfDoc.embedJpg(template.bytes)
        : await pdfDoc.embedPng(template.bytes);
    page.drawImage(templateImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  } else {
    drawFallbackBackground(page, width, height);

    page.drawText("Fliegenfischerschule Urs Mueller", {
      x: 34,
      y: height - 46,
      font: fontBold,
      size: 22,
      color: COLORS.mist,
    });
    page.drawText("Geschenkgutschein", {
      x: 34,
      y: height - 88,
      font: fontBold,
      size: 30,
      color: COLORS.forest,
    });
  }

  const qrBox = {
    x: width - 116,
    y: 44,
    width: 74,
    height: 74,
  };
  const recipientLine = recipient || "Name des Beschenkten";
  const recipientFontSize =
    recipientLine.length > 30
      ? 24
      : recipientLine.length > 24
        ? 28
        : recipientLine.length > 18
          ? 32
          : 36;
  const recipientWidth = fontSerifItalic.widthOfTextAtSize(
    recipientLine,
    recipientFontSize
  );
  page.drawText(recipientLine, {
    x: (width - recipientWidth) / 2,
    y: 184,
    font: fontSerifItalic,
    size: recipientFontSize,
    color: COLORS.forest,
  });

  const infoLine = purchaser
    ? `Ausgestellt fuer ${purchaser} am ${issuedDate}`
    : `Ausgestellt am ${issuedDate}`;
  const infoWidth = fontRegular.widthOfTextAtSize(infoLine, 10);
  const previewMessageLines = input.message
    ? limitLines(wrapText(input.message, 300, fontSerifItalic, 12), 2)
    : [];
  let previewMessageY = 150;
  for (const line of previewMessageLines) {
    const lineWidth = fontSerifItalic.widthOfTextAtSize(line, 12);
    page.drawText(line, {
      x: (width - lineWidth) / 2,
      y: previewMessageY,
      font: fontSerifItalic,
      size: 12,
      color: COLORS.forestSoft,
    });
    previewMessageY -= 15;
  }

  page.drawText("IM WERT VON", {
    x: (width - fontBold.widthOfTextAtSize("IM WERT VON", 10)) / 2,
    y: 106,
    font: fontBold,
    size: 10,
    color: COLORS.forestSoft,
  });

  const amountLine = `CHF ${formatCHF(input.amountCHF)}`;
  const amountWidth = fontBold.widthOfTextAtSize(amountLine, 20);
  page.drawText(amountLine, {
    x: (width - amountWidth) / 2,
    y: 86,
    font: fontBold,
    size: 20,
    color: COLORS.forest,
  });

  page.drawText(infoLine, {
    x: (width - infoWidth) / 2,
    y: 70,
    font: fontRegular,
    size: 10,
    color: COLORS.muted,
  });

  const detailsLines = input.message
    ? ["Einloesbar fuer Kurse und Privatunterricht."]
    : [
        "Einloesbar fuer Kurse und Privatunterricht.",
        "Keine Barauszahlung. Termin nach Vereinbarung.",
      ];
  let textY = 56;
  for (const line of detailsLines) {
    const lineWidth = fontRegular.widthOfTextAtSize(line, 10);
    page.drawText(line, {
      x: (width - lineWidth) / 2,
      y: textY,
      font: fontRegular,
      size: 10,
      color: COLORS.muted,
    });
    textY -= 12;
  }

  page.drawRectangle({
    x: 38,
    y: 30,
    width: 168,
    height: 42,
    color: COLORS.mist,
    borderColor: COLORS.line,
    borderWidth: 1,
    opacity: 0.94,
  });
  page.drawText("Gutschein-ID", {
    x: 50,
    y: 56,
    font: fontBold,
    size: 9,
    color: COLORS.muted,
  });
  page.drawText(input.code, {
    x: 50,
    y: 41,
    font: fontBold,
    size: 14,
    color: COLORS.forest,
  });

  page.drawRectangle({
    x: qrBox.x - 8,
    y: qrBox.y - 8,
    width: qrBox.width + 16,
    height: qrBox.height + 16,
    color: COLORS.mist,
    borderColor: COLORS.line,
    borderWidth: 1,
    opacity: 0.98,
  });

  const qrBytes = await createQrPngBytes(verificationUrl);
  const qrImage = await pdfDoc.embedPng(qrBytes);
  page.drawImage(qrImage, {
    x: qrBox.x,
    y: qrBox.y,
    width: qrBox.width,
    height: qrBox.height,
  });

  page.drawText("QR scannen", {
    x: qrBox.x + 6,
    y: qrBox.y - 4,
    font: fontBold,
    size: 9,
    color: COLORS.forest,
  });
  page.drawText("zum Pruefen", {
    x: qrBox.x + 3,
    y: qrBox.y - 15,
    font: fontRegular,
    size: 8,
    color: COLORS.muted,
  });

  return await pdfDoc.save();
}
