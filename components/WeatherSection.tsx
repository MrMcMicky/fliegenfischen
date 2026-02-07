"use client";

import { useMemo, useState } from "react";

import { SectionHeader } from "@/components/SectionHeader";
import {
  formatWindDirection,
  getWeatherIcon,
  getWeatherLabel,
  type WeatherForecast,
  type WeatherLocation,
} from "@/lib/weather";

type WeatherSectionProps = {
  section: {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
  locations: WeatherLocation[];
  weatherByLocation: Record<string, WeatherForecast | null | undefined>;
  initialLocationId: string | null | undefined;
};

const formatMetric = (value: number | null | undefined, unit: string) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `${Math.round(value)}${unit}`;
};

const fallbackTitle = (location?: WeatherLocation | null) => {
  if (!location) return "Vorhersage für Geroldswil";
  const label = location.fallback.label || location.label;
  return `Vorhersage für ${label}`;
};

export function WeatherSection({
  section,
  locations,
  weatherByLocation,
  initialLocationId,
}: WeatherSectionProps) {
  const [selectedId, setSelectedId] = useState(
    initialLocationId ?? locations[0]?.id ?? ""
  );

  const selectedLocation = useMemo(
    () => locations.find((loc) => loc.id === selectedId) ?? locations[0],
    [locations, selectedId]
  );

  const weather = weatherByLocation[selectedId] ?? null;
  const title = weather?.location
    ? `Vorhersage für ${weather.location}`
    : section.title || fallbackTitle(selectedLocation);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("w", id);
    url.hash = "wetter";
    window.history.replaceState(null, "", url.toString());
  };

  return (
    <section id="wetter" className="scroll-mt-16 bg-white py-12">
      <div className="mx-auto w-full max-w-5xl px-4">
        <SectionHeader
          eyebrow={section.eyebrow}
          title={title}
          description={section.description}
        />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {locations.map((location) => {
            const isActive = location.id === selectedId;
            return (
              <button
                key={location.id}
                type="button"
                onClick={() => handleSelect(location.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ember)] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  isActive
                    ? "border-[var(--color-forest)] bg-[var(--color-forest)] text-white shadow-sm"
                    : "border-[var(--color-border)] bg-white text-[var(--color-forest)] hover:border-[var(--color-forest)]/40 hover:text-[var(--color-forest)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {location.label}
              </button>
            );
          })}
          <span className="text-xs text-[var(--color-muted)]">
            Standard: Schulstandort Geroldswil.
          </span>
        </div>
        {weather ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                    Aktuell in {weather.location}
                  </p>
                  <div className="mt-3 flex items-baseline gap-3">
                    <p className="text-4xl font-semibold text-[var(--color-text)]">
                      {formatMetric(weather.current?.temperature ?? null, "°")}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {getWeatherLabel(weather.current?.weatherCode ?? null)}
                    </p>
                  </div>
                </div>
                <div className="text-4xl">
                  {getWeatherIcon(weather.current?.weatherCode ?? null)}
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                    Wind
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {formatMetric(weather.current?.windSpeed ?? null, " km/h")} {""}
                    {weather.current?.windDirection != null
                      ? `(${formatWindDirection(weather.current.windDirection)})`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                    Luftdruck
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {formatMetric(weather.current?.pressure ?? null, " hPa")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                    Niederschlag
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {formatMetric(weather.current?.precipitation ?? null, " mm")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                    Höhe
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {formatMetric(weather.elevation ?? null, " m")}
                  </p>
                </div>
              </div>
              <p className="mt-6 text-xs text-[var(--color-muted)]">
                Quelle: MeteoSwiss ICON CH1 (Open-Meteo)
              </p>
            </div>
            <div className="space-y-4">
              {weather.days.map((day) => (
                <div
                  key={day.date}
                  className="rounded-2xl border border-[var(--color-border)] bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                        {day.date}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                        {getWeatherLabel(day.weatherCode)}
                      </p>
                    </div>
                    <div className="text-3xl">
                      {getWeatherIcon(day.weatherCode)}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted)]">
                    <span>
                      {formatMetric(day.tempMax ?? null, "°")} /{" "}
                      {formatMetric(day.tempMin ?? null, "°")}
                    </span>
                    <span>
                      Regen {formatMetric(day.precipitationSum ?? null, " mm")}
                    </span>
                    <span>
                      Wind {formatMetric(day.windMax ?? null, " km/h")}
                    </span>
                    <span>
                      {formatMetric(day.precipitationProb ?? null, "%")} Regen
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
            Wetterdaten sind aktuell nicht verfügbar.
          </div>
        )}
      </div>
    </section>
  );
}
