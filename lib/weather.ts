const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const TIMEZONE = "Europe/Zurich";
const MODEL = "meteoswiss_icon_ch1";

export type WeatherNow = {
  time: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  pressure: number | null;
  precipitation: number | null;
  weatherCode: number | null;
};

export type WeatherDay = {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProb: number | null;
  windMax: number | null;
  windGusts: number | null;
  weatherCode: number | null;
};

export type WeatherForecast = {
  location: string;
  elevation: number | null;
  current: WeatherNow | null;
  days: WeatherDay[];
};

export const getWeatherLabel = (code: number | null) => {
  if (code === null || Number.isNaN(code)) return "Unbekannt";
  if (code === 0) return "Klar";
  if (code === 1 || code === 2) return "Leicht bewölkt";
  if (code === 3) return "Bewölkt";
  if (code === 45 || code === 48) return "Nebel";
  if ([51, 53, 55, 56, 57].includes(code)) return "Niesel";
  if ([61, 63, 65, 66, 67].includes(code)) return "Regen";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Schnee";
  if ([80, 81, 82].includes(code)) return "Schauer";
  if ([95, 96, 99].includes(code)) return "Gewitter";
  return "Wechselhaft";
};

export const getWeatherIcon = (code: number | null) => {
  if (code === null || Number.isNaN(code)) return "❔";
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([80, 81, 82].includes(code)) return "🌦️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌥️";
};

export const formatWindDirection = (degree: number) => {
  const directions = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
  const index = Math.round(degree / 45) % directions.length;
  return directions[index];
};

const fetchJson = async (url: string, revalidateSeconds: number) => {
  const response = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status})`);
  }
  return response.json();
};

export const getWeatherForecast = async (): Promise<WeatherForecast | null> => {
  try {
    const geoUrl = `${GEO_BASE}?name=${encodeURIComponent(
      "Geroldswil"
    )}&count=1&language=de&format=json`;
    const geo = await fetchJson(geoUrl, 86400);
    const locationResult = geo?.results?.[0];
    const latitude = locationResult?.latitude ?? 47.422;
    const longitude = locationResult?.longitude ?? 8.416;
    const locationLabel = locationResult
      ? `${locationResult.name}, ${locationResult.admin1 || locationResult.country}`
      : "Geroldswil, Zürich";

    const forecastUrl = new URL(FORECAST_BASE);
    forecastUrl.searchParams.set("latitude", latitude.toString());
    forecastUrl.searchParams.set("longitude", longitude.toString());
    forecastUrl.searchParams.set("timezone", TIMEZONE);
    forecastUrl.searchParams.set("models", MODEL);
    forecastUrl.searchParams.set("forecast_days", "4");
    forecastUrl.searchParams.set(
      "hourly",
      "temperature_2m,wind_speed_10m,wind_direction_10m,pressure_msl,weather_code,precipitation"
    );
    forecastUrl.searchParams.set(
      "daily",
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max"
    );
    forecastUrl.searchParams.set("current_weather", "true");

    let forecast;
    try {
      forecast = await fetchJson(forecastUrl.toString(), 900);
    } catch (error) {
      const fallbackUrl = new URL(forecastUrl.toString());
      fallbackUrl.searchParams.delete("models");
      forecast = await fetchJson(fallbackUrl.toString(), 900);
    }

    const currentWeather = forecast?.current_weather ?? null;
    const hourly = forecast?.hourly ?? null;
    let pressure: number | null = null;
    let precipitation: number | null = null;
    if (currentWeather && hourly?.time && hourly?.pressure_msl) {
      const index = hourly.time.indexOf(currentWeather.time);
      if (index >= 0) {
        pressure = hourly.pressure_msl?.[index] ?? null;
        precipitation = hourly.precipitation?.[index] ?? null;
      }
    }

    const current: WeatherNow | null = currentWeather
      ? {
          time: currentWeather.time,
          temperature: currentWeather.temperature,
          windSpeed: currentWeather.windspeed,
          windDirection: currentWeather.winddirection,
          pressure,
          precipitation,
          weatherCode: currentWeather.weathercode ?? null,
        }
      : null;

    const daily = forecast?.daily ?? {};
    const days: WeatherDay[] = Array.isArray(daily?.time)
      ? daily.time.slice(0, 3).map((date: string, index: number) => ({
          date,
          tempMax: daily.temperature_2m_max?.[index],
          tempMin: daily.temperature_2m_min?.[index],
          precipitationSum: daily.precipitation_sum?.[index],
          precipitationProb: daily.precipitation_probability_max?.[index] ?? null,
          windMax: daily.wind_speed_10m_max?.[index] ?? null,
          windGusts: daily.wind_gusts_10m_max?.[index] ?? null,
          weatherCode: daily.weather_code?.[index] ?? null,
        }))
      : [];

    return {
      location: locationLabel,
      elevation: forecast?.elevation ?? null,
      current,
      days,
    };
  } catch (error) {
    console.error("Weather fetch failed", error);
    return null;
  }
};
