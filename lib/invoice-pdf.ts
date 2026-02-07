import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import type { InvoiceData } from "@/lib/invoice";

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

export async function renderInvoicePdf(input: InvoiceData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
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

  page.drawText("Rechnung", {
    x: card.x + card.width - 140,
    y: card.y + card.height - 52,
    font: fontBold,
    size: 20,
    color: rgb(1, 1, 1),
  });

  page.drawText(input.seller.name, {
    x: margin,
    y: card.y + card.height - 48,
    font: fontBold,
    size: 16,
    color: rgb(1, 1, 1),
  });
  let headerInfoY = card.y + card.height - 68;
  if (input.seller.addressLines.length) {
    page.drawText(input.seller.addressLines.join(" · "), {
      x: margin,
      y: headerInfoY,
      font: fontRegular,
      size: 10,
      color: rgb(1, 1, 1),
    });
    headerInfoY -= 12;
  }
  const sellerContact = [
    input.seller.email,
    input.seller.phone,
    input.seller.mobile,
  ].filter(Boolean) as string[];
  sellerContact.forEach((line) => {
    if (headerInfoY < card.y + card.height - headerHeight + 8) return;
    page.drawText(line, {
      x: margin,
      y: headerInfoY,
      font: fontRegular,
      size: 9,
      color: rgb(1, 1, 1),
    });
    headerInfoY -= 11;
  });

  let cursorY = card.y + card.height - headerHeight - 24;

  page.drawText(`Rechnungsnummer: ${input.invoiceNumber}`, {
    x: margin,
    y: cursorY,
    font: fontRegular,
    size: 11,
    color: COLORS.muted,
  });
  cursorY -= 16;
  page.drawText(`Rechnungsdatum: ${formatDate(input.issuedAt)}`, {
    x: margin,
    y: cursorY,
    font: fontRegular,
    size: 11,
    color: COLORS.muted,
  });
  cursorY -= 16;
  page.drawText(`Fällig bis: ${formatDate(input.dueDate)}`, {
    x: margin,
    y: cursorY,
    font: fontRegular,
    size: 11,
    color: COLORS.muted,
  });

  cursorY -= 28;
  page.drawText("Rechnungsadresse", {
    x: margin,
    y: cursorY,
    font: fontBold,
    size: 12,
    color: COLORS.forest,
  });
  cursorY -= 16;
  const customerLines = [
    input.customer.name,
    ...input.customer.addressLines,
    input.customer.email || "",
    input.customer.phone ? `Tel. ${input.customer.phone}` : "",
  ].filter(Boolean);
  customerLines.forEach((line) => {
    page.drawText(line, {
      x: margin,
      y: cursorY,
      font: fontRegular,
      size: 11,
      color: COLORS.muted,
    });
    cursorY -= 14;
  });

  cursorY -= 16;
  page.drawText("Leistung", {
    x: margin,
    y: cursorY,
    font: fontBold,
    size: 12,
    color: COLORS.forest,
  });
  cursorY -= 14;

  const tableStartY = cursorY;
  const rowHeight = 18;
  const qtyWidth = 40;
  const unitWidth = 80;
  const totalWidth = 80;
  const descWidth = contentWidth - qtyWidth - unitWidth - totalWidth - 16;

  page.drawText("Beschreibung", {
    x: margin,
    y: tableStartY,
    font: fontBold,
    size: 10,
    color: COLORS.muted,
  });
  page.drawText("Anz.", {
    x: margin + descWidth + 6,
    y: tableStartY,
    font: fontBold,
    size: 10,
    color: COLORS.muted,
  });
  page.drawText("Preis", {
    x: margin + descWidth + qtyWidth + 8,
    y: tableStartY,
    font: fontBold,
    size: 10,
    color: COLORS.muted,
  });
  page.drawText("Total", {
    x: margin + descWidth + qtyWidth + unitWidth + 10,
    y: tableStartY,
    font: fontBold,
    size: 10,
    color: COLORS.muted,
  });

  cursorY -= 12;
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: margin + contentWidth, y: cursorY },
    color: COLORS.line,
    thickness: 1,
  });
  cursorY -= 12;

  input.items.forEach((item) => {
    const lines = wrapText(item.description, descWidth, fontRegular, 11);
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: margin,
        y: cursorY - index * rowHeight,
        font: fontRegular,
        size: 11,
        color: COLORS.muted,
      });
    });
    page.drawText(String(item.quantity), {
      x: margin + descWidth + 6,
      y: cursorY,
      font: fontRegular,
      size: 11,
      color: COLORS.muted,
    });
    page.drawText(`CHF ${formatCHF(item.unitPriceCHF)}`, {
      x: margin + descWidth + qtyWidth + 8,
      y: cursorY,
      font: fontRegular,
      size: 11,
      color: COLORS.muted,
    });
    page.drawText(`CHF ${formatCHF(item.totalCHF)}`, {
      x: margin + descWidth + qtyWidth + unitWidth + 10,
      y: cursorY,
      font: fontRegular,
      size: 11,
      color: COLORS.muted,
    });
    cursorY -= Math.max(lines.length, 1) * rowHeight + 8;
  });

  cursorY -= 4;
  page.drawLine({
    start: { x: margin, y: cursorY },
    end: { x: margin + contentWidth, y: cursorY },
    color: COLORS.line,
    thickness: 1,
  });

  cursorY -= 20;
  page.drawText("Total", {
    x: margin + descWidth + qtyWidth + unitWidth - 8,
    y: cursorY,
    font: fontBold,
    size: 12,
    color: COLORS.forest,
  });
  page.drawText(`CHF ${formatCHF(input.totalCHF)}`, {
    x: margin + descWidth + qtyWidth + unitWidth + 10,
    y: cursorY,
    font: fontBold,
    size: 12,
    color: COLORS.forest,
  });

  cursorY -= 30;
  if (input.paymentDetails.length) {
    page.drawText("Zahlungsinformationen", {
      x: margin,
      y: cursorY,
      font: fontBold,
      size: 12,
      color: COLORS.forest,
    });
    cursorY -= 16;
    input.paymentDetails.forEach((line) => {
      page.drawText(line, {
        x: margin,
        y: cursorY,
        font: fontRegular,
        size: 11,
        color: COLORS.muted,
      });
      cursorY -= 14;
    });
  }

  if (input.notes.length) {
    cursorY -= 8;
    input.notes.forEach((line) => {
      page.drawText(line, {
        x: margin,
        y: cursorY,
        font: fontRegular,
        size: 10,
        color: COLORS.muted,
      });
      cursorY -= 12;
    });
  }

  return await pdfDoc.save();
}
