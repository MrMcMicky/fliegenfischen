import { NextResponse } from "next/server";

import { buildInvoiceData } from "@/lib/invoice";
import { renderInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    if (!bookingId) {
      return NextResponse.json({ error: "missing_booking" }, { status: 400 });
    }

    const invoiceData = await buildInvoiceData(bookingId);
    if (!invoiceData) {
      return NextResponse.json({ error: "invoice_not_found" }, { status: 404 });
    }

    const pdfBytes = await renderInvoicePdf(invoiceData);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Rechnung-${invoiceData.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("invoice pdf failed", error);
    return NextResponse.json({ error: "invoice_pdf_failed" }, { status: 500 });
  }
}
