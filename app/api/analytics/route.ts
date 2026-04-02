import { NextResponse } from "next/server";

import {
  completeAnalyticsPageView,
  recordAnalyticsEvent,
  startAnalyticsPageView,
} from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const doNotTrack = request.headers.get("dnt");
    const globalPrivacyControl = request.headers.get("sec-gpc");
    if (doNotTrack === "1" || globalPrivacyControl === "1") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const payload = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!payload || typeof payload.type !== "string") {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent");
    const country = request.headers.get("cf-ipcountry");

    if (payload.type === "page_start") {
      const result = await startAnalyticsPageView({
        visitorKey: String(payload.visitorKey || ""),
        sessionKey: String(payload.sessionKey || ""),
        path: String(payload.path || ""),
        referrer: typeof payload.referrer === "string" ? payload.referrer : null,
        title: typeof payload.title === "string" ? payload.title : null,
        locale: typeof payload.locale === "string" ? payload.locale : null,
        utmSource:
          typeof payload.utmSource === "string" ? payload.utmSource : null,
        utmMedium:
          typeof payload.utmMedium === "string" ? payload.utmMedium : null,
        utmCampaign:
          typeof payload.utmCampaign === "string" ? payload.utmCampaign : null,
        utmTerm: typeof payload.utmTerm === "string" ? payload.utmTerm : null,
        utmContent:
          typeof payload.utmContent === "string" ? payload.utmContent : null,
        screenWidth:
          typeof payload.screenWidth === "number" ? payload.screenWidth : null,
        screenHeight:
          typeof payload.screenHeight === "number" ? payload.screenHeight : null,
        viewportWidth:
          typeof payload.viewportWidth === "number" ? payload.viewportWidth : null,
        viewportHeight:
          typeof payload.viewportHeight === "number" ? payload.viewportHeight : null,
        userAgent,
        country,
      });

      return NextResponse.json(result);
    }

    if (payload.type === "page_end") {
      const result = await completeAnalyticsPageView({
        sessionKey: String(payload.sessionKey || ""),
        pageViewId: String(payload.pageViewId || ""),
        durationMs:
          typeof payload.durationMs === "number" ? payload.durationMs : null,
        activeMs: typeof payload.activeMs === "number" ? payload.activeMs : null,
        maxScrollPercent:
          typeof payload.maxScrollPercent === "number"
            ? payload.maxScrollPercent
            : null,
      });

      return NextResponse.json(result);
    }

    if (payload.type === "event") {
      const result = await recordAnalyticsEvent({
        sessionKey: String(payload.sessionKey || ""),
        pageViewId:
          typeof payload.pageViewId === "string" ? payload.pageViewId : null,
        type: String(payload.eventType || ""),
        name: typeof payload.name === "string" ? payload.name : null,
        label: typeof payload.label === "string" ? payload.label : null,
        path: typeof payload.path === "string" ? payload.path : null,
        href: typeof payload.href === "string" ? payload.href : null,
        metadata:
          payload.metadata && typeof payload.metadata === "object"
            ? (payload.metadata as Record<string, unknown>)
            : null,
        userAgent,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ ok: false, error: "unsupported_type" }, { status: 400 });
  } catch (error) {
    console.error("analytics tracking failed", error);
    return NextResponse.json({ ok: false, error: "tracking_failed" }, { status: 500 });
  }
}
