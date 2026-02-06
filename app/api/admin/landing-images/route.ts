import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const sanitizeFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const maxFileSize = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const admin = await requireAdmin(undefined, request);
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files");
  if (!files.length) {
    return NextResponse.json({ error: "no_files" }, { status: 400 });
  }

  const folderPath = path.join(
    process.cwd(),
    "public",
    "illustrations",
    "landing"
  );
  await mkdir(folderPath, { recursive: true });

  const saved: string[] = [];

  for (const file of files) {
    if (!(file instanceof File)) {
      continue;
    }
    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      continue;
    }
    const originalName = path.basename(file.name || "landingbild");
    const ext = path.extname(originalName).toLowerCase() || ".jpg";
    if (!allowedExtensions.has(ext)) {
      continue;
    }
    const base =
      sanitizeFilename(path.basename(originalName, ext)) || "landingbild";
    const filename = `${base}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(folderPath, filename), buffer);
    saved.push(`/illustrations/landing/${filename}`);
  }

  if (!saved.length) {
    return NextResponse.json({ error: "no_valid_files" }, { status: 400 });
  }

  return NextResponse.json({ files: saved });
}
