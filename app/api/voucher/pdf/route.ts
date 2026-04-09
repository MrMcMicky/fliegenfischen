import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { renderVoucherPdf } from "@/lib/voucher-pdf";
import { normalizeVoucherCode } from "@/lib/vouchers";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  const code = normalizeVoucherCode(searchParams.get("code") || "");

  if (!bookingId && !code) {
    return NextResponse.json({ error: "missing_voucher_reference" }, { status: 400 });
  }

  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { voucher: true, voucherOption: true },
      })
    : null;

  const voucherFromCode = !booking && code
    ? await prisma.voucher.findUnique({
      where: { code },
        include: { booking: { include: { voucherOption: true } } },
      })
    : null;

  const resolvedBooking = booking ?? voucherFromCode?.booking ?? null;
  const resolvedVoucher = booking?.voucher ?? voucherFromCode ?? null;

  if (!resolvedBooking || !resolvedVoucher) {
    return NextResponse.json({ error: "voucher_not_found" }, { status: 404 });
  }

  const pdfBytes = await renderVoucherPdf({
    code: resolvedVoucher.code,
    amountCHF: resolvedVoucher.originalAmount,
    voucherTitle: resolvedBooking.voucherOption?.title,
    recipientName: resolvedVoucher.recipientName,
    message: resolvedVoucher.message,
    purchaserName: resolvedBooking.customerName,
    issuedAt: resolvedVoucher.createdAt,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Gutschein-${resolvedVoucher.code}.pdf"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
