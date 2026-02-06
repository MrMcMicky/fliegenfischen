#!/usr/bin/env node

const path = require("path");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config({ path: path.join(rootDir, ".env") });

const CHECK_TIMEZONE = "Europe/Zurich";
const SITE_URL = "https://fliegenfischer-schule.shop";
const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const PRIMARY_MODEL = "meteoswiss_icon_ch1";

const healthRecipient =
  process.env.HEALTHCHECK_EMAIL_TO ||
  process.env.CONTACT_EMAIL_TO ||
  process.env.SMTP_TO ||
  "michael@ruppen.net";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === "true";
const smtpFrom =
  process.env.SMTP_FROM || "Urs Müller <info@fliegenfischer-schule.shop>";

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.json();
};

const buildForecastUrl = ({ latitude, longitude, model }) => {
  const url = new URL(FORECAST_BASE);
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("timezone", CHECK_TIMEZONE);
  url.searchParams.set("forecast_days", "4");
  if (model) {
    url.searchParams.set("models", model);
  }
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max"
  );
  url.searchParams.set("current_weather", "true");
  return url.toString();
};

const hasTemperatureData = (daily) => {
  if (!daily || !Array.isArray(daily.temperature_2m_max)) return false;
  return daily.temperature_2m_max.some((value) => typeof value === "number");
};

const runChecks = async () => {
  const issues = [];

  try {
    const response = await fetch(SITE_URL, { redirect: "follow" });
    if (!response.ok) {
      issues.push(`Website unreachable: ${SITE_URL} (${response.status})`);
    } else {
      const body = await response.text();
      if (!body.includes("Fliegenfischerschule")) {
        issues.push("Website content check failed (missing expected marker).");
      }
    }
  } catch (error) {
    issues.push(`Website check error: ${error.message}`);
  }

  try {
    const geoUrl = `${GEO_BASE}?name=${encodeURIComponent(
      "Geroldswil, Zürich"
    )}&count=1&language=de&format=json`;
    const geo = await fetchJson(geoUrl);
    if (!geo?.results?.length) {
      issues.push("Geocoding returned no results for Geroldswil.");
    }
  } catch (error) {
    issues.push(`Geocoding error: ${error.message}`);
  }

  const latitude = 47.422;
  const longitude = 8.416;

  try {
    const modelData = await fetchJson(
      buildForecastUrl({ latitude, longitude, model: PRIMARY_MODEL })
    );
    if (!hasTemperatureData(modelData?.daily)) {
      issues.push(
        "MeteoSwiss model forecast missing temperature data (Geroldswil)."
      );
    }
  } catch (error) {
    issues.push(`MeteoSwiss model fetch error: ${error.message}`);
  }

  try {
    const fallbackData = await fetchJson(
      buildForecastUrl({ latitude, longitude })
    );
    if (!hasTemperatureData(fallbackData?.daily)) {
      issues.push("Fallback forecast missing temperature data (Geroldswil).");
    }
  } catch (error) {
    issues.push(`Fallback forecast fetch error: ${error.message}`);
  }

  return issues;
};

const sendAlert = async (issues) => {
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error(
      "Missing SMTP credentials for health-check email (SMTP_HOST/PORT/USER/PASS)."
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const subject =
    "[ALERT] fliegenfischer-schule.shop weekly health check failed";
  const timestamp = new Date().toLocaleString("de-CH", {
    timeZone: CHECK_TIMEZONE,
  });
  const text = `Der wöchentliche Health-Check hat Probleme gefunden (${timestamp}).\n\n- ${issues.join(
    "\n- "
  )}\n`;

  await transporter.sendMail({
    to: healthRecipient,
    from: smtpFrom,
    subject,
    text,
  });
};

(async () => {
  const issues = await runChecks();
  if (issues.length === 0) {
    console.log("Health check OK.");
    process.exit(0);
  }

  try {
    await sendAlert(issues);
    console.error("Health check issues detected; alert email sent.");
    process.exit(1);
  } catch (error) {
    console.error("Health check issues detected but email failed:", error);
    process.exit(1);
  }
})();
