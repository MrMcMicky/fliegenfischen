const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined) =>
  value === "1" || value === "true" || value === "yes" || value === "on";

const requireSecret = (value: string | undefined, name: string): string => {
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Environment variable ${name} must be set in production.`);
  }
  return "dev-secret";
};

export const env = {
  appUrl: process.env.APP_URL || "http://localhost:3000",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  voucherTestPaymentBypass: toBoolean(process.env.VOUCHER_TEST_PAYMENT_BYPASS),
  adminCookieSecret: requireSecret(process.env.ADMIN_COOKIE_SECRET, "ADMIN_COOKIE_SECRET"),
  sessionMaxAgeDays: toNumber(process.env.SESSION_MAX_AGE_DAYS, 7),
  nodeEnv: process.env.NODE_ENV || "development",
};

export const isProd = env.nodeEnv === "production";
