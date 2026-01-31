import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { renderVoucherPdf } from "@/lib/voucher-pdf";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json({ error: "missing_booking" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { voucher: true },
  });

  if (!booking?.voucher) {
    return NextResponse.json({ error: "voucher_not_found" }, { status: 404 });
  }

  const pdfBytes = await renderVoucherPdf({
    code: booking.voucher.code,
    amountCHF: booking.voucher.originalAmount,
    recipientName: booking.voucher.recipientName,
    message: booking.voucher.message,
    purchaserName: booking.customerName,
    issuedAt: booking.voucher.createdAt,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"Gutschein-${booking.voucher.code}.pdf\"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
