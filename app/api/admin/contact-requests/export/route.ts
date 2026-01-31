import { NextResponse } from "next/server";

import { ContactRequestStatus } from "@prisma/client";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const escapeCsv = (value: string) =>
  `"${value.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

const toCsvRow = (values: (string | null | undefined)[]) =>
  values.map((value) => escapeCsv(value ?? "")).join(",");

export async function GET(request: Request) {
  const admin = await requireAdmin(undefined, request);
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = (url.searchParams.get("status") || "all").toUpperCase();
  const allowedStatuses = new Set(["OPEN", "DONE", "ARCHIVED", "ALL"]);
  const statusFilter = allowedStatuses.has(statusParam)
    ? (statusParam as "OPEN" | "DONE" | "ARCHIVED" | "ALL")
    : "ALL";

  const where =
    statusFilter === "ALL"
      ? undefined
      : { status: statusFilter as ContactRequestStatus };

  const requests = await prisma.contactRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const header = toCsvRow([
    "Datum",
    "Status",
    "Name",
    "E-Mail",
    "Telefon",
    "Betreff",
    "Nachricht",
  ]);

  const rows = requests.map((item) =>
    toCsvRow([
      item.createdAt.toISOString(),
      item.status,
      item.name,
      item.email,
      item.phone || "",
      item.subject || "",
      item.message,
    ])
  );

  const csv = `\ufeff${[header, ...rows].join("\n")}\n`;
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kontaktanfragen-${date}.csv"`,
    },
  });
}
