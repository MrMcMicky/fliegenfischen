import { NextResponse } from "next/server";

import { SESSION_COOKIE, deleteSessionByToken, getSessionToken } from "@/lib/auth";
import { isProd } from "@/lib/env";

export async function POST(request: Request) {
  const token = await getSessionToken(request);
  await deleteSessionByToken(token);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/admin",
    expires: new Date(0),
  });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    expires: new Date(0),
  });
  return response;
}
