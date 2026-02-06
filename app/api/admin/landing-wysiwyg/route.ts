import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const arrayRoots = new Set([
  "uspItems",
  "faqs",
  "testimonials",
  "coursePathSteps",
  "categorySummaries",
]);

const objectRoots = new Set([
  "homeHero",
  "homeSections",
  "aboutSection",
  "testimonialSection",
  "contact",
]);

const allowedRoots = new Set([...arrayRoots, ...objectRoots]);

const parsePath = (path: string) =>
  path
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean);

const isIndex = (segment: string) => /^\d+$/.test(segment);

const setDeepValue = (target: unknown, segments: string[], value: string) => {
  let current = target as Record<string, unknown> | unknown[];

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];
    const key = isIndex(segment) ? Number(segment) : segment;

    if (typeof key === "number") {
      if (!Array.isArray(current)) {
        throw new Error("invalid_path");
      }
      if (current[key] == null) {
        current[key] = isIndex(nextSegment) ? [] : {};
      }
      current = current[key] as Record<string, unknown> | unknown[];
    } else {
      if (Array.isArray(current)) {
        throw new Error("invalid_path");
      }
      if (current[key] == null) {
        current[key] = isIndex(nextSegment) ? [] : {};
      }
      current = current[key] as Record<string, unknown> | unknown[];
    }
  }

  const last = segments[segments.length - 1];
  if (!last) return;
  const lastKey = isIndex(last) ? Number(last) : last;

  if (typeof lastKey === "number") {
    if (!Array.isArray(current)) {
      throw new Error("invalid_path");
    }
    current[lastKey] = value;
  } else {
    if (Array.isArray(current)) {
      throw new Error("invalid_path");
    }
    current[lastKey] = value;
  }
};

export async function POST(request: Request) {
  const admin = await requireAdmin(undefined, request);
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | { path?: string; value?: string }
    | null;

  if (!payload?.path) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const segments = parsePath(payload.path);
  const root = segments.shift();

  if (!root || !allowedRoots.has(root)) {
    return NextResponse.json({ error: "invalid_path" }, { status: 400 });
  }
  if (segments.includes("href") && admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    return NextResponse.json({ error: "missing_settings" }, { status: 404 });
  }

  const rootValue = (settings as Record<string, Prisma.InputJsonValue>)[root];
  const fallback = arrayRoots.has(root) ? [] : {};
  const updatedRoot = JSON.parse(JSON.stringify(rootValue ?? fallback));

  try {
    setDeepValue(updatedRoot, segments, String(payload.value ?? ""));
  } catch {
    return NextResponse.json({ error: "invalid_path" }, { status: 400 });
  }

  await prisma.siteSettings.update({
    where: { id: 1 },
    data: { [root]: updatedRoot } as Prisma.SiteSettingsUpdateInput,
  });

  return NextResponse.json({ ok: true });
}
