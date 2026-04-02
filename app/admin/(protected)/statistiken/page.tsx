import Link from "next/link";

import { getAnalyticsDashboard } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("de-CH").format(value);

const formatDuration = (valueMs: number) => {
  if (!valueMs) return "0s";
  const totalSeconds = Math.round(valueMs / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("de-CH", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-[var(--color-text)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{note}</p>
    </div>
  );
}

function BarList({
  title,
  items,
  valueFormatter = formatNumber,
}: {
  title: string;
  items: { label: string; count: number; note?: string }[];
  valueFormatter?: (value: number) => string;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
      <h3 className="font-display text-xl font-semibold text-[var(--color-text)]">
        {title}
      </h3>
      <div className="mt-5 space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-[var(--color-text)]">
                  {item.label}
                </span>
                <span className="text-[var(--color-muted)]">
                  {valueFormatter(item.count)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-pebble)]">
                <div
                  className="h-full rounded-full bg-[var(--color-forest)]"
                  style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }}
                />
              </div>
              {item.note ? (
                <p className="text-xs text-[var(--color-muted)]">{item.note}</p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--color-muted)]">Noch keine Daten.</p>
        )}
      </div>
    </div>
  );
}

function SessionJourneyCard({
  item,
}: {
  item: {
    visitorLabel: string;
    startedAt: Date;
    landingPath: string;
    referrerLabel: string;
    device: string;
    browser: string;
    country: string;
    pageCount: number;
    clickCount: number;
    durationMs: number;
    activeMs: number;
    pages: {
      path: string;
      count: number;
      avgActiveMs: number;
      avgDurationMs: number;
    }[];
  };
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            {item.visitorLabel}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--color-text)]">
            {item.landingPath}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Start {formatDateTime(item.startedAt)} · Referrer {item.referrerLabel}
          </p>
        </div>
        <div className="rounded-xl bg-[var(--color-stone)] px-3 py-2 text-right text-sm text-[var(--color-muted)]">
          <div>{item.device}</div>
          <div>
            {item.browser} · {item.country}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Seiten
          </p>
          <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">
            {formatNumber(item.pageCount)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Aktiv
          </p>
          <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">
            {formatDuration(item.activeMs)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Sitzung
          </p>
          <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">
            {formatDuration(item.durationMs)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Klicks
          </p>
          <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">
            {formatNumber(item.clickCount)}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
          Meistbesuchte Seiten dieser Sitzung
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.pages.length ? (
            item.pages.map((page) => (
              <div
                key={`${item.visitorLabel}-${page.path}`}
                className="rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)]"
              >
                <span className="font-semibold">{page.path}</span>
                <span className="ml-2 text-[var(--color-muted)]">
                  {page.count}x · {formatDuration(page.avgActiveMs)} aktiv
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--color-muted)]">Noch keine Pageviews.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function AdminStatistikenPage({
  searchParams,
}: {
  searchParams?: { days?: string } | Promise<{ days?: string }>;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const requestedDays = Number((resolvedParams as { days?: string })?.days || "30");
  const data = await getAnalyticsDashboard(requestedDays);

  const trendMax = Math.max(
    ...data.trend.map((entry) => Math.max(entry.sessions, entry.pageViews)),
    1
  );

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Statistiken
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--color-text)]">
            Besucher, Seiten und Conversion-Signale
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-[var(--color-muted)]">
            First-party Analytics ohne externe Skripte. Erfasst werden Sitzungen,
            Pageviews, Aufenthaltszeit, Scrolltiefe, Referrer, Kampagnen-Parameter
            und Klicks auf Links oder Buttons der öffentlichen Website.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[7, 30, 90].map((days) => {
            const active = data.days === days;
            return (
              <Link
                key={days}
                href={`/admin/statistiken?days=${days}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[var(--color-forest)] text-white"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-forest)]/30"
                }`}
              >
                Letzte {days} Tage
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Einzigartige Besucher"
          value={formatNumber(data.metrics.uniqueVisitors)}
          note={`${formatNumber(data.metrics.sessionCount)} Sitzungen im Zeitraum`}
        />
        <MetricCard
          label="Pageviews"
          value={formatNumber(data.metrics.pageViewCount)}
          note={`${formatDuration(data.metrics.avgActiveMs)} aktive Zeit pro Seitenaufruf`}
        />
        <MetricCard
          label="Interaktionen"
          value={formatNumber(data.metrics.clickEventCount)}
          note={`${data.metrics.avgScrollPercent}% durchschnittliche Scrolltiefe`}
        />
        <MetricCard
          label="Absprungrate"
          value={`${data.metrics.bounceRate}%`}
          note={`${formatDuration(data.metrics.avgSessionMs)} durchschnittliche Sitzungsdauer`}
        />
        <MetricCard
          label="Buchungen"
          value={formatNumber(data.metrics.bookingCount)}
          note="Erstellte Buchungen im gleichen Zeitraum"
        />
        <MetricCard
          label="Kontaktanfragen"
          value={formatNumber(data.metrics.contactCount)}
          note="Abgeschickte Formulare im gleichen Zeitraum"
        />
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              Verlauf
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold text-[var(--color-text)]">
              Sitzungen und Seitenaufrufe pro Tag
            </h3>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          {data.trend.map((entry) => (
            <div key={entry.date} className="grid gap-2 lg:grid-cols-[110px_1fr_1fr_80px_80px] lg:items-center">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {entry.date.slice(5)}
              </span>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                  <span>Sitzungen</span>
                  <span>{formatNumber(entry.sessions)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-pebble)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-forest)]"
                    style={{ width: `${Math.max(4, (entry.sessions / trendMax) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
                  <span>Pageviews</span>
                  <span>{formatNumber(entry.pageViews)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-pebble)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-ember)]"
                    style={{ width: `${Math.max(4, (entry.pageViews / trendMax) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-[var(--color-muted)]">
                {entry.bookings} Buchungen
              </div>
              <div className="text-sm text-[var(--color-muted)]">
                {entry.contacts} Anfragen
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Besucherwege
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold text-[var(--color-text)]">
            Neueste Sitzungen im Detail
          </h3>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            Pseudonymisierte Besucherpfade mit Landingpage, Referrer, Geraet,
            Aufenthaltszeit und den wichtigsten besuchten Seiten.
          </p>
        </div>
        <div className="grid gap-4">
          {data.recentSessions.length ? (
            data.recentSessions.map((item) => (
              <SessionJourneyCard
                key={`${item.visitorLabel}-${item.startedAt.toISOString()}`}
                item={item}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
              Noch keine Sitzungsdaten vorhanden.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarList
          title="Top-Seiten"
          items={data.topPages.map((item) => ({
            label: item.path,
            count: item.count,
            note: `${formatDuration(item.avgActiveMs)} aktiv · ${item.avgScrollPercent}% Scroll`,
          }))}
        />
        <BarList
          title="Landingpages"
          items={data.landingPages.map((item) => ({
            label: item.path,
            count: item.count,
          }))}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarList title="Referrer" items={data.referrers} />
        <BarList title="Kampagnen / UTM" items={data.campaigns} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <BarList title="Geräte" items={data.devices} />
        <BarList title="Browser" items={data.browsers} />
        <BarList title="Länder" items={data.countries} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BarList
          title="Meistgeklickte Ziele"
          items={data.clickTargets.map((item) => ({
            label: item.label,
            count: item.count,
            note: item.href || undefined,
          }))}
        />
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
          <h3 className="font-display text-xl font-semibold text-[var(--color-text)]">
            Conversion-Kontext
          </h3>
          <div className="mt-5 grid gap-4 text-sm text-[var(--color-muted)]">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Buchungen
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                {formatNumber(data.metrics.bookingCount)}
              </p>
              <p className="mt-2">
                Enthält Kurs-, Privat-, Schnupper- und Gutscheinbuchungen. Die
                Seitenpfade zeigen zusätzlich, welche Angebotsseiten am meisten
                besucht wurden.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Kontakt
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                {formatNumber(data.metrics.contactCount)}
              </p>
              <p className="mt-2">
                Kontaktanfragen werden parallel mitgezählt, damit du sie mit
                Sitzungen, Referrern und Kampagnen vergleichen kannst.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
