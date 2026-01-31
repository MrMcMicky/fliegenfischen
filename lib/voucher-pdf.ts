import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type VoucherPdfInput = {
  code: string;
  amountCHF: number;
  recipientName?: string | null;
  message?: string | null;
  purchaserName?: string | null;
  issuedAt?: Date;
};

const COLORS = {
  forest: rgb(15 / 255, 50 / 255, 49 / 255),
  ember: rgb(232 / 255, 134 / 255, 72 / 255),
  stone: rgb(248 / 255, 247 / 255, 244 / 255),
  muted: rgb(74 / 255, 85 / 255, 104 / 255),
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

export async function renderVoucherPdf(input: VoucherPdfInput) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 56;
  const headerHeight = 88;

  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width,
    height: headerHeight,
    color: COLORS.forest,
  });

  page.drawText("Fliegenfischerschule Urs Müller", {
    x: margin,
    y: height - 46,
    font: fontBold,
    size: 18,
    color: rgb(1, 1, 1),
  });
  page.drawText("Geroldswil / Limmat, Zürich", {
    x: margin,
    y: height - 66,
    font: fontRegular,
    size: 10,
    color: rgb(1, 1, 1),
  });

  const iconPath = path.join(
    process.cwd(),
    "public",
    "illustrations",
    "icon-rod.png"
  );
  try {
    const iconBytes = await fs.readFile(iconPath);
    const iconImage = await pdfDoc.embedPng(iconBytes);
    page.drawImage(iconImage, {
      x: width - margin - 48,
      y: height - 72,
      width: 40,
      height: 40,
      opacity: 0.9,
    });
  } catch {
    // Optional icon; ignore if missing.
  }

  let cursorY = height - headerHeight - 42;
  page.drawText("Gutschein", {
    x: margin,
    y: cursorY,
    font: fontBold,
    size: 34,
    color: COLORS.forest,
  });

  cursorY -= 44;
  page.drawText(`CHF ${formatCHF(input.amountCHF)}`, {
    x: margin,
    y: cursorY,
    font: fontBold,
    size: 28,
    color: COLORS.ember,
  });

  cursorY -= 24;
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: width - margin, y: cursorY },
    thickness: 1,
    color: COLORS.stone,
  });

  cursorY -= 36;
  page.drawRectangle({
    x: margin,
    y: cursorY - 48,
    width: width - margin * 2,
    height: 56,
    borderColor: COLORS.forest,
    borderWidth: 1,
    color: COLORS.stone,
  });

  page.drawText("Gutschein-Code", {
    x: margin + 16,
    y: cursorY - 6,
    font: fontBold,
    size: 10,
    color: COLORS.muted,
  });
  page.drawText(input.code, {
    x: margin + 16,
    y: cursorY - 32,
    font: fontBold,
    size: 20,
    color: COLORS.forest,
  });

  cursorY -= 96;
  const issuedDate = input.issuedAt ? formatDate(input.issuedAt) : formatDate(new Date());
  const recipient = input.recipientName?.trim();
  const purchaser = input.purchaserName?.trim();

  if (recipient) {
    page.drawText(`Für: ${recipient}`, {
      x: margin,
      y: cursorY,
      font: fontBold,
      size: 12,
      color: COLORS.forest,
    });
    cursorY -= 20;
  }

  if (input.message) {
    page.drawText("Nachricht:", {
      x: margin,
      y: cursorY,
      font: fontBold,
      size: 11,
      color: COLORS.muted,
    });
    cursorY -= 18;
    const lines = wrapText(
      input.message,
      width - margin * 2,
      fontRegular,
      11
    );
    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y: cursorY,
        font: fontRegular,
        size: 11,
        color: COLORS.muted,
      });
      cursorY -= 15;
    }
    cursorY -= 6;
  }

  const metaLines = [
    purchaser ? `Ausgestellt für: ${purchaser}` : null,
    `Ausstellungsdatum: ${issuedDate}`,
    "Einlösbar für Kurse und Privatunterricht.",
    "Keine Barauszahlung. Termin nach Vereinbarung.",
  ].filter(Boolean) as string[];

  for (const line of metaLines) {
    page.drawText(line, {
      x: margin,
      y: cursorY,
      font: fontRegular,
      size: 10,
      color: COLORS.muted,
    });
    cursorY -= 14;
  }

  page.drawText("fliegenfischer-schule.shop", {
    x: margin,
    y: 36,
    font: fontBold,
    size: 10,
    color: COLORS.forest,
  });
  page.drawText("info@fliegenfischer-schule.ch", {
    x: margin,
    y: 20,
    font: fontRegular,
    size: 9,
    color: COLORS.muted,
  });

  return await pdfDoc.save();
}
