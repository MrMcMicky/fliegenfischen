export const browserAnalyticsEventName = "fliegenfischen:analytics";

export type BrowserAnalyticsEventDetail = {
  eventType: string;
  name?: string | null;
  label?: string | null;
  href?: string | null;
  path?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const dispatchBrowserAnalyticsEvent = (
  detail: BrowserAnalyticsEventDetail
) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(browserAnalyticsEventName, {
      detail,
    })
  );
};
