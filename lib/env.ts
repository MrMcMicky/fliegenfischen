const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  appUrl: process.env.APP_URL || "http://localhost:3000",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  adminCookieSecret: process.env.ADMIN_COOKIE_SECRET || "dev-secret",
  sessionMaxAgeDays: toNumber(process.env.SESSION_MAX_AGE_DAYS, 7),
  nodeEnv: process.env.NODE_ENV || "development",
};

export const isProd = env.nodeEnv === "production";
