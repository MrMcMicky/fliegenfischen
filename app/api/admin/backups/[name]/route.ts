import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import type { NextRequest } from "next/server";

import { getAdminFromSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  const params = await context.params;
  const admin = await getAdminFromSession(request);
  if (!admin || admin.role !== "SUPER_ADMIN") {
    return new Response("Nicht autorisiert.", { status: 401 });
  }

  const rawName = params.name || "";
  const safeName = path.basename(rawName);
  if (!safeName || safeName !== rawName) {
    return new Response("Ungültiger Dateiname.", { status: 400 });
  }

  const backupRoot = "/home/michael/backups/fliegenfischen";
  const filePath = path.join(backupRoot, safeName);

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return new Response("Datei nicht gefunden.", { status: 404 });
    }

    const stream = createReadStream(filePath);
    return new Response(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": info.size.toString(),
        "Content-Disposition": `attachment; filename="${safeName}"`,
      },
    });
  } catch {
    return new Response("Datei nicht gefunden.", { status: 404 });
  }
}
