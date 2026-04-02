"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  usePathname,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";

import {
  browserAnalyticsEventName,
  type BrowserAnalyticsEventDetail,
} from "@/lib/browser-analytics";

const STORAGE_KEYS = {
  visitor: "fliegenfischen_visitor_key",
  session: "fliegenfischen_session_key",
};

const EXCLUDED_QUERY_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
]);

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getOrCreateStorageValue = (storage: Storage, key: string) => {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const created = createId();
  storage.setItem(key, created);
  return created;
};

const buildTrackedPath = (
  pathname: string,
  searchParams: URLSearchParams | ReadonlyURLSearchParams
) => {
  const filteredParams = Array.from(searchParams.entries()).filter(
    ([key]) => !EXCLUDED_QUERY_KEYS.has(key)
  );
  if (!filteredParams.length) {
    return pathname;
  }

  const query = new URLSearchParams(filteredParams);
  query.sort();
  return `${pathname}?${query.toString()}`;
};

const getMarketingParams = (
  searchParams: URLSearchParams | ReadonlyURLSearchParams
) => ({
  utmSource: searchParams.get("utm_source"),
  utmMedium: searchParams.get("utm_medium"),
  utmCampaign: searchParams.get("utm_campaign"),
  utmTerm: searchParams.get("utm_term"),
  utmContent: searchParams.get("utm_content"),
});

const isTrackingDisabledByPreference = () => {
  const navigatorWithPrivacy = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  const windowWithPrivacy = window as Window & {
    doNotTrack?: string;
  };
  const doNotTrack =
    navigator.doNotTrack || windowWithPrivacy.doNotTrack || null;

  return (
    doNotTrack === "1" ||
    doNotTrack?.toLowerCase() === "yes" ||
    navigatorWithPrivacy.globalPrivacyControl === true
  );
};

const getScrollPercent = () => {
  const root = document.documentElement;
  const scrollHeight = root.scrollHeight - window.innerHeight;
  if (scrollHeight <= 0) {
    return 100;
  }
  return Math.min(
    100,
    Math.round((window.scrollY / scrollHeight) * 100) + 1
  );
};

const sendKeepalive = (payload: Record<string, unknown>) => {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics", blob);
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
};

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathRef = useRef<string | null>(null);

  const trackedPath = useMemo(
    () => buildTrackedPath(pathname, searchParams),
    [pathname, searchParams]
  );
  const marketingParams = useMemo(
    () => getMarketingParams(searchParams),
    [searchParams]
  );

  useEffect(() => {
    if (!pathname || isTrackingDisabledByPreference()) {
      return;
    }

    let visitorKey = "";
    let sessionKey = "";
    try {
      visitorKey = getOrCreateStorageValue(localStorage, STORAGE_KEYS.visitor);
      sessionKey = getOrCreateStorageValue(sessionStorage, STORAGE_KEYS.session);
    } catch {
      return;
    }

    const referrer = previousPathRef.current || document.referrer || null;
    previousPathRef.current = trackedPath;

    let pageViewId: string | null = null;
    let completed = false;
    let maxScrollPercent = getScrollPercent();
    const startedAt = Date.now();
    let activeStartedAt: number | null = null;
    let activeMs = 0;
    let queuedEndPayload: Record<string, unknown> | null = null;

    const beginActiveWindow = () => {
      if (document.visibilityState === "visible" && document.hasFocus()) {
        if (activeStartedAt === null) {
          activeStartedAt = Date.now();
        }
      }
    };

    const endActiveWindow = () => {
      if (activeStartedAt !== null) {
        activeMs += Date.now() - activeStartedAt;
        activeStartedAt = null;
      }
    };

    const flushEndPayload = () => {
      if (!pageViewId || !queuedEndPayload) {
        return;
      }
      sendKeepalive({
        ...queuedEndPayload,
        pageViewId,
        sessionKey,
      });
      queuedEndPayload = null;
    };

    const completeTracking = (reason: string) => {
      if (completed) {
        return;
      }
      completed = true;
      endActiveWindow();

      const payload = {
        type: "page_end",
        durationMs: Date.now() - startedAt,
        activeMs,
        maxScrollPercent,
        reason,
      };

      if (!pageViewId) {
        queuedEndPayload = payload;
        return;
      }

      sendKeepalive({
        ...payload,
        pageViewId,
        sessionKey,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        beginActiveWindow();
      } else {
        endActiveWindow();
      }
    };

    const handleFocus = () => beginActiveWindow();
    const handleBlur = () => endActiveWindow();
    const handleScroll = () => {
      maxScrollPercent = Math.max(maxScrollPercent, getScrollPercent());
    };
    const handlePageHide = () => completeTracking("pagehide");

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const actionTarget = target.closest("a,button") as
        | HTMLAnchorElement
        | HTMLButtonElement
        | null;

      if (!actionTarget) {
        return;
      }

      const tagName = actionTarget.tagName.toLowerCase();
      const href =
        tagName === "a"
          ? (actionTarget as HTMLAnchorElement).href || null
          : null;
      const label =
        actionTarget.getAttribute("aria-label") ||
        actionTarget.textContent?.replace(/\s+/g, " ").trim() ||
        null;

      if (!label || label.length < 2) {
        return;
      }

      sendKeepalive({
        type: "event",
        sessionKey,
        pageViewId,
        eventType: tagName === "a" ? "link_click" : "button_click",
        label,
        href,
        path: trackedPath,
        metadata: {
          element: tagName,
          isExternal:
            typeof href === "string" &&
            href.length > 0 &&
            !href.startsWith(window.location.origin) &&
            !href.startsWith("/"),
        },
      });
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) {
        return;
      }

      const label =
        form.getAttribute("aria-label") ||
        form.getAttribute("name") ||
        form.id ||
        form.getAttribute("action") ||
        trackedPath;

      sendKeepalive({
        type: "event",
        sessionKey,
        pageViewId,
        eventType: "form_submit",
        label,
        path: trackedPath,
        metadata: {
          action: form.getAttribute("action"),
          method: (form.getAttribute("method") || "post").toUpperCase(),
        },
      });
    };

    const handleCustomAnalyticsEvent = (event: Event) => {
      const detail = (event as CustomEvent<BrowserAnalyticsEventDetail>).detail;
      if (!detail?.eventType) {
        return;
      }

      sendKeepalive({
        type: "event",
        sessionKey,
        pageViewId,
        eventType: detail.eventType,
        name: detail.name,
        label: detail.label,
        href: detail.href,
        path: detail.path || trackedPath,
        metadata: detail.metadata,
      });
    };

    beginActiveWindow();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener(
      browserAnalyticsEventName,
      handleCustomAnalyticsEvent as EventListener
    );

    void fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "page_start",
        visitorKey,
        sessionKey,
        path: trackedPath,
        referrer,
        title: document.title,
        locale: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        ...marketingParams,
      }),
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.pageViewId) {
          pageViewId = payload.pageViewId;
          flushEndPayload();
        }
      })
      .catch(() => undefined);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener(
        browserAnalyticsEventName,
        handleCustomAnalyticsEvent as EventListener
      );
      completeTracking("route_change");
    };
  }, [pathname, trackedPath, marketingParams]);

  return null;
}
