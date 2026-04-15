import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const FRONT_PREVIEW_HOSTS = new Set([
  "test.fliegenfischer-schule.shop",
]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (host && FRONT_PREVIEW_HOSTS.has(host) && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/test";
    return NextResponse.rewrite(url);
  }

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-section", "1");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
