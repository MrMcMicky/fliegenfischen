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
  paper: rgb(1, 1, 1),
  line: rgb(226 / 255, 232 / 255, 240 / 255),
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

  const cardMargin = 24;
  const headerHeight = 90;
  const card = {
    x: cardMargin,
    y: cardMargin,
    width: width - cardMargin * 2,
    height: height - cardMargin * 2,
  };
  const margin = card.x + 36;
  const contentWidth = card.width - 72;

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: COLORS.stone,
  });

  page.drawRectangle({
    x: card.x,
    y: card.y,
    width: card.width,
    height: card.height,
    color: COLORS.paper,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: card.x,
    y: card.y + card.height - headerHeight,
    width: card.width,
    height: headerHeight,
    color: COLORS.forest,
  });

  page.drawText("Fliegenfischerschule Urs Müller", {
    x: margin,
    y: card.y + card.height - 48,
    font: fontBold,
    size: 18,
    color: rgb(1, 1, 1),
  });
  page.drawText("Geroldswil / Limmat, Zürich", {
    x: margin,
    y: card.y + card.height - 68,
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
      x: card.x + card.width - 36 - 40,
      y: card.y + card.height - 74,
      width: 40,
      height: 40,
      opacity: 0.9,
    });
  } catch {
    // Optional icon; ignore if missing.
  }

  let cursorY = card.y + card.height - headerHeight - 38;
  page.drawText("GESCHENKGUTSCHEIN", {
    x: margin,
    y: cursorY,
    font: fontBold,
    size: 10,
    color: COLORS.muted,
  });
  cursorY -= 24;
  page.drawText("Gutschein", {
    x: margin,
    y: cursorY,
    font: fontBold,
    size: 32,
    color: COLORS.forest,
  });

  cursorY -= 48;
  const amountBoxHeight = 34;
  const amountBoxWidth = 170;
  page.drawRectangle({
    x: margin,
    y: cursorY - amountBoxHeight + 6,
    width: amountBoxWidth,
    height: amountBoxHeight,
    color: COLORS.stone,
    borderColor: COLORS.ember,
    borderWidth: 1,
  });
  page.drawText(`CHF ${formatCHF(input.amountCHF)}`, {
    x: margin + 12,
    y: cursorY - amountBoxHeight + 16,
    font: fontBold,
    size: 20,
    color: COLORS.ember,
  });

  cursorY -= 40;
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: margin + contentWidth, y: cursorY },
    thickness: 1,
    color: COLORS.line,
  });

  cursorY -= 28;
  page.drawRectangle({
    x: margin,
    y: cursorY - 50,
    width: contentWidth,
    height: 60,
    borderColor: COLORS.line,
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
    y: cursorY - 34,
    font: fontBold,
    size: 22,
    color: COLORS.forest,
  });

  cursorY -= 92;
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
      contentWidth,
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

  page.drawText("Hinweise:", {
    x: margin,
    y: cursorY,
    font: fontBold,
    size: 11,
    color: COLORS.muted,
  });
  cursorY -= 18;

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

  page.drawLine({
    start: { x: margin, y: card.y + 58 },
    end: { x: margin + contentWidth, y: card.y + 58 },
    thickness: 1,
    color: COLORS.line,
  });

  page.drawText("fliegenfischer-schule.shop", {
    x: margin,
    y: card.y + 36,
    font: fontBold,
    size: 10,
    color: COLORS.forest,
  });
  page.drawText("info@fliegenfischer-schule.shop", {
    x: margin,
    y: card.y + 20,
    font: fontRegular,
    size: 9,
    color: COLORS.muted,
  });

  return await pdfDoc.save();
}
