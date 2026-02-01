import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

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
  const rawSlug = String(formData.get("slug") || "");
  const slug = slugify(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "missing_slug" }, { status: 400 });
  }

  const files = formData.getAll("files");
  if (!files.length) {
    return NextResponse.json({ error: "no_files" }, { status: 400 });
  }

  const folderPath = path.join(process.cwd(), "public", "berichte", slug);
  await mkdir(folderPath, { recursive: true });

  const file = files.find((entry) => entry instanceof File) as File | undefined;
  if (!file) {
    return NextResponse.json({ error: "no_valid_files" }, { status: 400 });
  }
  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  const originalName = path.basename(file.name || "cover");
  const ext = path.extname(originalName).toLowerCase() || ".jpg";
  if (!allowedExtensions.has(ext)) {
    return NextResponse.json({ error: "invalid_extension" }, { status: 400 });
  }
  const base = sanitizeFilename(path.basename(originalName, ext)) || "cover";
  const filename = `${base}-cover-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(folderPath, filename), buffer);
  const filePath = `/berichte/${slug}/${filename}`;

  return NextResponse.json({ file: filePath });
}
