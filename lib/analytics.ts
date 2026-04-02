import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

const BOT_PATTERNS = [
  /bot/i,
  /spider/i,
  /crawler/i,
  /crawl/i,
  /preview/i,
  /slurp/i,
  /headless/i,
  /lighthouse/i,
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const sanitizeString = (value: unknown, maxLength = 255) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLength);
};

const sanitizePath = (value: unknown) => sanitizeString(value, 512);

const toDayKey = (date: Date) => date.toISOString().slice(0, 10);

const buildReferrerLabel = (value?: string | null) => {
  if (!value) return "Direkt / Unbekannt";
  if (value.startsWith("/")) return `Intern ${value}`;
  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
};

const buildCampaignLabel = ({
  utmSource,
  utmMedium,
  utmCampaign,
}: {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}) => {
  const parts = [utmSource, utmMedium, utmCampaign].filter(Boolean);
  return parts.length ? parts.join(" / ") : "Ohne Kampagne";
};

export const isBotUserAgent = (userAgent?: string | null) =>
  !userAgent || BOT_PATTERNS.some((pattern) => pattern.test(userAgent));

export const parseUserAgent = (userAgent?: string | null) => {
  const ua = userAgent || "";
  const deviceType = /ipad|tablet/i.test(ua)
    ? "Tablet"
    : /mobi|android/i.test(ua)
      ? "Mobile"
      : "Desktop";

  let browser = "Unbekannt";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "Unbekannt";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { deviceType, browser, os };
};

type AnalyticsStartPayload = {
  visitorKey: string;
  sessionKey: string;
  path: string;
  referrer?: string | null;
  title?: string | null;
  locale?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
  userAgent?: string | null;
  country?: string | null;
};

export async function startAnalyticsPageView(payload: AnalyticsStartPayload) {
  if (isBotUserAgent(payload.userAgent)) {
    return { ignored: true as const };
  }

  const visitorKey = sanitizeString(payload.visitorKey, 128);
  const sessionKey = sanitizeString(payload.sessionKey, 128);
  const path = sanitizePath(payload.path);

  if (!visitorKey || !sessionKey || !path) {
    return { ignored: true as const };
  }

  const now = new Date();
  const { deviceType, browser, os } = parseUserAgent(payload.userAgent);

  const visitor = await prisma.analyticsVisitor.upsert({
    where: { visitorKey },
    create: {
      visitorKey,
      firstSeenAt: now,
      lastSeenAt: now,
    },
    update: {
      lastSeenAt: now,
    },
  });

  const session = await prisma.analyticsSession.upsert({
    where: { sessionKey },
    create: {
      visitorId: visitor.id,
      sessionKey,
      landingPath: path,
      landingReferrer: sanitizeString(payload.referrer, 1024),
      utmSource: sanitizeString(payload.utmSource, 120),
      utmMedium: sanitizeString(payload.utmMedium, 120),
      utmCampaign: sanitizeString(payload.utmCampaign, 180),
      utmTerm: sanitizeString(payload.utmTerm, 180),
      utmContent: sanitizeString(payload.utmContent, 180),
      deviceType,
      browser,
      os,
      country: sanitizeString(payload.country, 12),
      locale: sanitizeString(payload.locale, 32),
      screenWidth:
        typeof payload.screenWidth === "number"
          ? clamp(payload.screenWidth, 0, 10000)
          : null,
      screenHeight:
        typeof payload.screenHeight === "number"
          ? clamp(payload.screenHeight, 0, 10000)
          : null,
      viewportWidth:
        typeof payload.viewportWidth === "number"
          ? clamp(payload.viewportWidth, 0, 10000)
          : null,
      viewportHeight:
        typeof payload.viewportHeight === "number"
          ? clamp(payload.viewportHeight, 0, 10000)
          : null,
      startedAt: now,
      lastSeenAt: now,
    },
    update: {
      lastSeenAt: now,
      deviceType,
      browser,
      os,
      country: sanitizeString(payload.country, 12),
      locale: sanitizeString(payload.locale, 32),
      screenWidth:
        typeof payload.screenWidth === "number"
          ? clamp(payload.screenWidth, 0, 10000)
          : undefined,
      screenHeight:
        typeof payload.screenHeight === "number"
          ? clamp(payload.screenHeight, 0, 10000)
          : undefined,
      viewportWidth:
        typeof payload.viewportWidth === "number"
          ? clamp(payload.viewportWidth, 0, 10000)
          : undefined,
      viewportHeight:
        typeof payload.viewportHeight === "number"
          ? clamp(payload.viewportHeight, 0, 10000)
          : undefined,
    },
  });

  const pageView = await prisma.analyticsPageView.create({
    data: {
      sessionId: session.id,
      path,
      referrer: sanitizeString(payload.referrer, 1024),
      title: sanitizeString(payload.title, 255),
      startedAt: now,
    },
  });

  return {
    ignored: false as const,
    pageViewId: pageView.id,
  };
}

export async function completeAnalyticsPageView({
  sessionKey,
  pageViewId,
  durationMs,
  activeMs,
  maxScrollPercent,
}: {
  sessionKey: string;
  pageViewId: string;
  durationMs?: number | null;
  activeMs?: number | null;
  maxScrollPercent?: number | null;
}) {
  const normalizedSessionKey = sanitizeString(sessionKey, 128);
  const normalizedPageViewId = sanitizeString(pageViewId, 128);

  if (!normalizedSessionKey || !normalizedPageViewId) {
    return { ok: false as const };
  }

  const pageView = await prisma.analyticsPageView.findFirst({
    where: {
      id: normalizedPageViewId,
      session: {
        sessionKey: normalizedSessionKey,
      },
    },
    select: {
      id: true,
      sessionId: true,
    },
  });

  if (!pageView) {
    return { ok: false as const };
  }

  const now = new Date();

  await prisma.analyticsPageView.update({
    where: { id: pageView.id },
    data: {
      endedAt: now,
      durationMs:
        typeof durationMs === "number" ? clamp(durationMs, 0, 86_400_000) : null,
      activeMs:
        typeof activeMs === "number" ? clamp(activeMs, 0, 86_400_000) : null,
      maxScrollPercent:
        typeof maxScrollPercent === "number"
          ? clamp(maxScrollPercent, 0, 100)
          : null,
    },
  });

  await prisma.analyticsSession.update({
    where: { id: pageView.sessionId },
    data: {
      lastSeenAt: now,
    },
  });

  return { ok: true as const };
}

export async function recordAnalyticsEvent({
  sessionKey,
  pageViewId,
  type,
  name,
  label,
  path,
  href,
  metadata,
  userAgent,
}: {
  sessionKey: string;
  pageViewId?: string | null;
  type: string;
  name?: string | null;
  label?: string | null;
  path?: string | null;
  href?: string | null;
  metadata?: Record<string, unknown> | null;
  userAgent?: string | null;
}) {
  if (isBotUserAgent(userAgent)) {
    return { ok: true as const, ignored: true as const };
  }

  const normalizedSessionKey = sanitizeString(sessionKey, 128);
  const normalizedType = sanitizeString(type, 64);

  if (!normalizedSessionKey || !normalizedType) {
    return { ok: false as const, ignored: false as const };
  }

  const session = await prisma.analyticsSession.findUnique({
    where: { sessionKey: normalizedSessionKey },
    select: { id: true },
  });

  if (!session) {
    return { ok: false as const, ignored: false as const };
  }

  const normalizedMetadata = metadata
    ? (JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue)
    : undefined;

  await prisma.analyticsEvent.create({
    data: {
      sessionId: session.id,
      pageViewId: sanitizeString(pageViewId, 128),
      type: normalizedType,
      name: sanitizeString(name, 120),
      label: sanitizeString(label, 255),
      path: sanitizePath(path),
      href: sanitizeString(href, 1024),
      metadata: normalizedMetadata,
    },
  });

  await prisma.analyticsSession.update({
    where: { id: session.id },
    data: {
      lastSeenAt: new Date(),
    },
  });

  return { ok: true as const, ignored: false as const };
}

const sortEntries = <T extends { count: number }>(entries: T[], limit = 8) =>
  entries.sort((a, b) => b.count - a.count).slice(0, limit);

const buildVisitorLabel = (sessionKey: string) =>
  `V-${sessionKey.slice(0, 8).toUpperCase()}`;

export async function getAnalyticsDashboard(days: number) {
  const normalizedDays = clamp(Number.isFinite(days) ? days : 30, 7, 90);
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (normalizedDays - 1));

  const [sessions, pageViews, events, bookings, contactRequests] = await Promise.all([
    prisma.analyticsSession.findMany({
      where: { startedAt: { gte: since } },
      select: {
        id: true,
        visitorId: true,
        sessionKey: true,
        landingPath: true,
        landingReferrer: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        deviceType: true,
        browser: true,
        os: true,
        country: true,
        startedAt: true,
        lastSeenAt: true,
        _count: {
          select: {
            pageViews: true,
            events: true,
          },
        },
      },
    }),
    prisma.analyticsPageView.findMany({
      where: { startedAt: { gte: since } },
      select: {
        id: true,
        sessionId: true,
        path: true,
        startedAt: true,
        durationMs: true,
        activeMs: true,
        maxScrollPercent: true,
      },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: {
        sessionId: true,
        type: true,
        label: true,
        href: true,
        path: true,
        createdAt: true,
      },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, type: true, paymentMode: true },
    }),
    prisma.contactRequest.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const uniqueVisitors = new Set(sessions.map((session) => session.visitorId)).size;
  const sessionCount = sessions.length;
  const pageViewCount = pageViews.length;
  const bounceSessions = sessions.filter(
    (session) => session._count.pageViews <= 1
  ).length;
  const bounceRate = sessionCount
    ? Math.round((bounceSessions / sessionCount) * 100)
    : 0;

  const avgActiveMs = pageViews.length
    ? Math.round(
        pageViews.reduce((sum, pageView) => sum + (pageView.activeMs || 0), 0) /
          pageViews.length
      )
    : 0;
  const avgScrollPercent = pageViews.length
    ? Math.round(
        pageViews.reduce(
          (sum, pageView) => sum + (pageView.maxScrollPercent || 0),
          0
        ) / pageViews.length
      )
    : 0;
  const avgSessionMs = sessionCount
    ? Math.round(
        sessions.reduce(
          (sum, session) =>
            sum + (session.lastSeenAt.getTime() - session.startedAt.getTime()),
          0
        ) / sessionCount
      )
    : 0;

  const topPagesMap = new Map<
    string,
    {
      path: string;
      count: number;
      totalDurationMs: number;
      totalActiveMs: number;
      totalScrollPercent: number;
    }
  >();
  for (const pageView of pageViews) {
    const entry = topPagesMap.get(pageView.path) || {
      path: pageView.path,
      count: 0,
      totalDurationMs: 0,
      totalActiveMs: 0,
      totalScrollPercent: 0,
    };
    entry.count += 1;
    entry.totalDurationMs += pageView.durationMs || 0;
    entry.totalActiveMs += pageView.activeMs || 0;
    entry.totalScrollPercent += pageView.maxScrollPercent || 0;
    topPagesMap.set(pageView.path, entry);
  }

  const topPages = sortEntries(
    Array.from(topPagesMap.values()).map((entry) => ({
      path: entry.path,
      count: entry.count,
      avgDurationMs: Math.round(entry.totalDurationMs / entry.count),
      avgActiveMs: Math.round(entry.totalActiveMs / entry.count),
      avgScrollPercent: Math.round(entry.totalScrollPercent / entry.count),
    })),
    10
  );

  const landingPagesMap = new Map<string, number>();
  const referrersMap = new Map<string, number>();
  const devicesMap = new Map<string, number>();
  const browsersMap = new Map<string, number>();
  const countriesMap = new Map<string, number>();
  const campaignsMap = new Map<string, number>();
  for (const session of sessions) {
    landingPagesMap.set(
      session.landingPath,
      (landingPagesMap.get(session.landingPath) || 0) + 1
    );
    const referrerLabel = buildReferrerLabel(session.landingReferrer);
    referrersMap.set(referrerLabel, (referrersMap.get(referrerLabel) || 0) + 1);
    const device = session.deviceType || "Unbekannt";
    devicesMap.set(device, (devicesMap.get(device) || 0) + 1);
    const browser = session.browser || "Unbekannt";
    browsersMap.set(browser, (browsersMap.get(browser) || 0) + 1);
    const country = session.country || "Unbekannt";
    countriesMap.set(country, (countriesMap.get(country) || 0) + 1);
    const campaign = buildCampaignLabel(session);
    campaignsMap.set(campaign, (campaignsMap.get(campaign) || 0) + 1);
  }

  const clickEvents = events.filter(
    (event) => event.type === "link_click" || event.type === "button_click"
  );
  const eventsBySession = new Map<
    string,
    {
      type: string;
      label: string | null;
      href: string | null;
      path: string | null;
      createdAt: Date;
    }[]
  >();
  for (const event of events) {
    const sessionEvents = eventsBySession.get(event.sessionId) || [];
    sessionEvents.push(event);
    eventsBySession.set(event.sessionId, sessionEvents);
  }

  const pageViewsBySession = new Map<
    string,
    {
      id: string;
      sessionId: string;
      path: string;
      startedAt: Date;
      durationMs: number | null;
      activeMs: number | null;
      maxScrollPercent: number | null;
    }[]
  >();
  for (const pageView of pageViews) {
    const sessionPageViews = pageViewsBySession.get(pageView.sessionId) || [];
    sessionPageViews.push(pageView);
    pageViewsBySession.set(pageView.sessionId, sessionPageViews);
  }

  const clickTargetsMap = new Map<
    string,
    { label: string; href?: string | null; count: number }
  >();
  for (const event of clickEvents) {
    const key = `${event.label || "Ohne Label"}::${event.href || ""}`;
    const entry = clickTargetsMap.get(key) || {
      label: event.label || "Ohne Label",
      href: event.href,
      count: 0,
    };
    entry.count += 1;
    clickTargetsMap.set(key, entry);
  }

  const trendMap = new Map<
    string,
    {
      date: string;
      sessions: number;
      pageViews: number;
      bookings: number;
      contacts: number;
    }
  >();

  for (let offset = 0; offset < normalizedDays; offset += 1) {
    const date = new Date(since);
    date.setUTCDate(since.getUTCDate() + offset);
    const key = toDayKey(date);
    trendMap.set(key, {
      date: key,
      sessions: 0,
      pageViews: 0,
      bookings: 0,
      contacts: 0,
    });
  }

  for (const session of sessions) {
    const key = toDayKey(session.startedAt);
    const entry = trendMap.get(key);
    if (entry) entry.sessions += 1;
  }
  for (const pageView of pageViews) {
    const key = toDayKey(pageView.startedAt);
    const entry = trendMap.get(key);
    if (entry) entry.pageViews += 1;
  }
  for (const booking of bookings) {
    const key = toDayKey(booking.createdAt);
    const entry = trendMap.get(key);
    if (entry) entry.bookings += 1;
  }
  for (const contactRequest of contactRequests) {
    const key = toDayKey(contactRequest.createdAt);
    const entry = trendMap.get(key);
    if (entry) entry.contacts += 1;
  }

  const recentSessions = sessions
    .slice()
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, 12)
    .map((session) => {
      const sessionPageViews = (pageViewsBySession.get(session.id) || [])
        .slice()
        .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
      const sessionEvents = eventsBySession.get(session.id) || [];
      const sessionClickCount = sessionEvents.filter(
        (event) => event.type === "link_click" || event.type === "button_click"
      ).length;
      const pageMap = new Map<
        string,
        { path: string; count: number; totalActiveMs: number; totalDurationMs: number }
      >();

      for (const pageView of sessionPageViews) {
        const entry = pageMap.get(pageView.path) || {
          path: pageView.path,
          count: 0,
          totalActiveMs: 0,
          totalDurationMs: 0,
        };
        entry.count += 1;
        entry.totalActiveMs += pageView.activeMs || 0;
        entry.totalDurationMs += pageView.durationMs || 0;
        pageMap.set(pageView.path, entry);
      }

      return {
        visitorLabel: buildVisitorLabel(session.sessionKey),
        startedAt: session.startedAt,
        landingPath: session.landingPath,
        referrerLabel: buildReferrerLabel(session.landingReferrer),
        device: session.deviceType || "Unbekannt",
        browser: session.browser || "Unbekannt",
        country: session.country || "Unbekannt",
        pageCount: sessionPageViews.length,
        clickCount: sessionClickCount,
        durationMs: session.lastSeenAt.getTime() - session.startedAt.getTime(),
        activeMs: sessionPageViews.reduce(
          (sum, pageView) => sum + (pageView.activeMs || 0),
          0
        ),
        pages: Array.from(pageMap.values())
          .sort((a, b) => b.count - a.count || b.totalActiveMs - a.totalActiveMs)
          .slice(0, 4)
          .map((entry) => ({
            path: entry.path,
            count: entry.count,
            avgActiveMs: Math.round(entry.totalActiveMs / entry.count),
            avgDurationMs: Math.round(entry.totalDurationMs / entry.count),
          })),
      };
    });

  return {
    days: normalizedDays,
    since,
    metrics: {
      uniqueVisitors,
      sessionCount,
      pageViewCount,
      clickEventCount: clickEvents.length,
      bookingCount: bookings.length,
      contactCount: contactRequests.length,
      bounceRate,
      avgActiveMs,
      avgScrollPercent,
      avgSessionMs,
    },
    trend: Array.from(trendMap.values()),
    topPages,
    landingPages: sortEntries(
      Array.from(landingPagesMap.entries()).map(([path, count]) => ({
        path,
        count,
      })),
      8
    ),
    referrers: sortEntries(
      Array.from(referrersMap.entries()).map(([label, count]) => ({
        label,
        count,
      })),
      8
    ),
    devices: sortEntries(
      Array.from(devicesMap.entries()).map(([label, count]) => ({
        label,
        count,
      })),
      6
    ),
    browsers: sortEntries(
      Array.from(browsersMap.entries()).map(([label, count]) => ({
        label,
        count,
      })),
      6
    ),
    countries: sortEntries(
      Array.from(countriesMap.entries()).map(([label, count]) => ({
        label,
        count,
      })),
      6
    ),
    campaigns: sortEntries(
      Array.from(campaignsMap.entries()).map(([label, count]) => ({
        label,
        count,
      })),
      8
    ),
    clickTargets: sortEntries(Array.from(clickTargetsMap.values()), 10),
    recentSessions,
  };
}
