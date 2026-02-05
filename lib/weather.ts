const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const TIMEZONE = "Europe/Zurich";
const PRIMARY_MODEL = "meteoswiss_icon_ch1";

export type WeatherLocation = {
  id: string;
  label: string;
  query: string;
  fallback: {
    label: string;
    latitude: number;
    longitude: number;
  };
};

export const weatherLocations: WeatherLocation[] = [
  {
    id: "geroldswil",
    label: "Geroldswil (Limmat)",
    query: "Geroldswil, Zürich",
    fallback: {
      label: "Geroldswil, Zürich",
      latitude: 47.422,
      longitude: 8.416,
    },
  },
  {
    id: "dietikon",
    label: "Dietikon (Limmat)",
    query: "Dietikon, Zürich",
    fallback: {
      label: "Dietikon, Zürich",
      latitude: 47.401,
      longitude: 8.400,
    },
  },
  {
    id: "wettingen",
    label: "Wettingen (Limmat)",
    query: "Wettingen, Aargau",
    fallback: {
      label: "Wettingen, Aargau",
      latitude: 47.467,
      longitude: 8.317,
    },
  },
  {
    id: "bremgarten",
    label: "Bremgarten (Reuss)",
    query: "Bremgarten, Aargau",
    fallback: {
      label: "Bremgarten, Aargau",
      latitude: 47.351,
      longitude: 8.345,
    },
  },
  {
    id: "brugg",
    label: "Brugg (Aare)",
    query: "Brugg, Aargau",
    fallback: {
      label: "Brugg, Aargau",
      latitude: 47.480,
      longitude: 8.208,
    },
  },
];

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
  tempMax: number | null;
  tempMin: number | null;
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

const buildForecastUrl = ({
  latitude,
  longitude,
  model,
  codesOnly,
}: {
  latitude: number;
  longitude: number;
  model?: string;
  codesOnly?: boolean;
}) => {
  const url = new URL(FORECAST_BASE);
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("timezone", TIMEZONE);
  url.searchParams.set("forecast_days", "4");
  if (model) {
    url.searchParams.set("models", model);
  }

  if (codesOnly) {
    url.searchParams.set("daily", "weather_code");
    url.searchParams.set("current_weather", "true");
    return url;
  }

  url.searchParams.set(
    "hourly",
    "temperature_2m,wind_speed_10m,wind_direction_10m,pressure_msl,weather_code,precipitation"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max"
  );
  url.searchParams.set("current_weather", "true");
  return url;
};

const getLocationById = (id?: string) =>
  weatherLocations.find((location) => location.id === id) ||
  weatherLocations[0];

const resolveLocation = async (location: WeatherLocation) => {
  const geoUrl = `${GEO_BASE}?name=${encodeURIComponent(
    location.query
  )}&count=1&language=de&format=json`;
  const geo = await fetchJson(geoUrl, 86400);
  const result = geo?.results?.[0];
  if (result) {
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      label: `${result.name}, ${result.admin1 || result.country}`,
    };
  }
  return location.fallback;
};

export const getWeatherForecast = async (
  locationId?: string
): Promise<WeatherForecast | null> => {
  try {
    const location = getLocationById(locationId);
    const resolvedLocation = await resolveLocation(location);
    const { latitude, longitude, label: locationLabel } = resolvedLocation;

    let forecast;
    try {
      forecast = await fetchJson(
        buildForecastUrl({
          latitude,
          longitude,
          model: PRIMARY_MODEL,
          codesOnly: false,
        }).toString(),
        900
      );
    } catch (error) {
      forecast = await fetchJson(
        buildForecastUrl({
          latitude,
          longitude,
          codesOnly: false,
        }).toString(),
        900
      );
    }

    let codeFallback: {
      current_weather?: { weathercode?: number | null };
      daily?: { weather_code?: Array<number | null> };
    } | null = null;

    const currentWeather = forecast?.current_weather ?? null;
    const daily = forecast?.daily ?? null;
    const needsCodeFallback =
      currentWeather?.weathercode == null ||
      !daily?.weather_code ||
      daily.weather_code.some((value: number | null) => value == null);

    if (needsCodeFallback) {
      try {
        codeFallback = await fetchJson(
          buildForecastUrl({
            latitude,
            longitude,
            codesOnly: true,
          }).toString(),
          900
        );
      } catch (error) {
        codeFallback = null;
      }
    }

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

    const currentWeatherCode =
      currentWeather?.weathercode ?? codeFallback?.current_weather?.weathercode ?? null;

    const current: WeatherNow | null = currentWeather
      ? {
          time: currentWeather.time,
          temperature: currentWeather.temperature,
          windSpeed: currentWeather.windspeed,
          windDirection: currentWeather.winddirection,
          pressure,
          precipitation,
          weatherCode: currentWeatherCode,
        }
      : null;

    const dailyData = forecast?.daily ?? {};
    const fallbackCodes = codeFallback?.daily?.weather_code ?? [];
    const days: WeatherDay[] = Array.isArray(dailyData?.time)
      ? dailyData.time.slice(0, 3).map((date: string, index: number) => ({
          date,
          tempMax: dailyData.temperature_2m_max?.[index] ?? null,
          tempMin: dailyData.temperature_2m_min?.[index] ?? null,
          precipitationSum: dailyData.precipitation_sum?.[index] ?? 0,
          precipitationProb:
            dailyData.precipitation_probability_max?.[index] ?? null,
          windMax: dailyData.wind_speed_10m_max?.[index] ?? null,
          windGusts: dailyData.wind_gusts_10m_max?.[index] ?? null,
          weatherCode:
            dailyData.weather_code?.[index] ?? fallbackCodes?.[index] ?? null,
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
