import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/Button";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildVoucherVerificationPath,
  normalizeVoucherCode,
  voucherStatusLabels,
} from "@/lib/vouchers";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Gutschein pruefen",
    description: "Gutscheinstatus online pruefen oder im Admin einloesen.",
    path: "/gutscheine/pruefen",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const updateMessages: Record<string, string> = {
  redeemed: "Der Gutschein wurde als eingeloest markiert.",
  active: "Der Gutschein wurde wieder aktiviert.",
  expired: "Der Gutschein wurde als abgelaufen markiert.",
  missing: "Der Gutschein konnte nicht gefunden werden.",
};

const badgeStyles = {
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  REDEEMED:
    "border-slate-300 bg-slate-100 text-slate-700",
  EXPIRED:
    "border-amber-200 bg-amber-50 text-amber-800",
} as const;

export default async function GutscheinPruefenPage({
  searchParams,
}: {
  searchParams?:
    | { code?: string; updated?: string }
    | URLSearchParams
    | Promise<unknown>;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const params =
    resolvedParams && typeof (resolvedParams as { get?: unknown }).get === "function"
      ? Object.fromEntries((resolvedParams as URLSearchParams).entries())
      : (resolvedParams ?? {});

  const rawCode = (params as { code?: string }).code || "";
  const updated = (params as { updated?: string }).updated || "";
  const code = normalizeVoucherCode(rawCode);
  const admin = await getAdminFromSession();
  const voucher = code
    ? await prisma.voucher.findUnique({
        where: { code },
        include: {
          booking: {
            include: {
              voucherOption: true,
            },
          },
        },
      })
    : null;

  async function updateVoucherState(formData: FormData) {
    "use server";

    const currentAdmin = await getAdminFromSession();
    if (!currentAdmin) {
      redirect("/admin/login");
    }

    const submittedCode = normalizeVoucherCode(String(formData.get("code") || ""));
    const intent = String(formData.get("intent") || "");
    if (!submittedCode) {
      redirect("/gutscheine/pruefen");
    }

    const currentVoucher = await prisma.voucher.findUnique({
      where: { code: submittedCode },
    });
    if (!currentVoucher) {
      redirect(`${buildVoucherVerificationPath(submittedCode)}&updated=missing`);
    }

    if (intent === "redeem") {
      await prisma.voucher.update({
        where: { id: currentVoucher.id },
        data: {
          status: "REDEEMED",
          remainingAmount: 0,
        },
      });
      redirect(`${buildVoucherVerificationPath(submittedCode)}&updated=redeemed`);
    }

    if (intent == "activate") {
      await prisma.voucher.update({
        where: { id: currentVoucher.id },
        data: {
          status: "ACTIVE",
          remainingAmount: currentVoucher.originalAmount,
        },
      });
      redirect(`${buildVoucherVerificationPath(submittedCode)}&updated=active`);
    }

    if (intent === "expire") {
      await prisma.voucher.update({
        where: { id: currentVoucher.id },
        data: {
          status: "EXPIRED",
          remainingAmount: 0,
        },
      });
      redirect(`${buildVoucherVerificationPath(submittedCode)}&updated=expired`);
    }

    redirect(buildVoucherVerificationPath(submittedCode));
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 pb-20 pt-16">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
          Gutschein pruefen
        </p>
        <h1 className="font-display text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
          QR-Code scannen oder Gutschein-Code eingeben
        </h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
          Diese Seite zeigt den aktuellen Gutscheinstatus. Angemeldete Admins
          koennen Gutscheine hier direkt als eingeloest markieren.
        </p>
      </div>

      <form
        action="/gutscheine/pruefen"
        method="get"
        className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
      >
        <label
          htmlFor="voucher-code"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]"
        >
          Gutschein-Code
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="voucher-code"
            name="code"
            defaultValue={code}
            placeholder="z. B. AB12CD34EF"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm uppercase tracking-[0.15em] text-[var(--color-text)] focus:border-[var(--color-ember)] focus:outline-none focus:ring-4 focus:ring-[var(--color-ember)]/15"
          />
          <Button type="submit">Pruefen</Button>
        </div>
      </form>

      {updated && updateMessages[updated] ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {updateMessages[updated]}
        </div>
      ) : null}

      {!code ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-stone)] p-6 text-sm text-[var(--color-muted)]">
          Gib einen Gutschein-Code ein oder scanne den QR-Code auf dem PDF.
        </div>
      ) : null}

      {code && !voucher ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Kein Gutschein mit diesem Code gefunden.
        </div>
      ) : null}

      {voucher ? (
        <div className="space-y-6 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Code
              </p>
              <p className="mt-2 font-display text-3xl font-semibold uppercase tracking-[0.08em] text-[var(--color-text)]">
                {voucher.code}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${badgeStyles[voucher.status]}`}
            >
              {voucherStatusLabels[voucher.status]}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-[var(--color-stone)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Gutscheinart
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {voucher.booking?.voucherOption?.title || "Gutschein"}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-stone)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Ursprungswert
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {formatPrice(voucher.originalAmount)}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-stone)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Restwert
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {formatPrice(voucher.remainingAmount)}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--color-stone)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Ausgestellt
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                {formatDate(voucher.createdAt)}
              </p>
            </div>
          </div>

          {voucher.recipientName || voucher.message ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)]/60 p-5">
              {voucher.recipientName ? (
                <p className="text-sm text-[var(--color-text)]">
                  <span className="font-semibold">Empfaenger:</span>{" "}
                  {voucher.recipientName}
                </p>
              ) : null}
              {voucher.message ? (
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  {voucher.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-5">
            <Button href="/gutscheine" variant="secondary">
              Neue Gutscheine bestellen
            </Button>
            <Button href="/kontakt" variant="secondary">
              Rueckfrage senden
            </Button>
            {voucher.bookingId ? (
              <Button
                href={`/api/voucher/pdf?code=${voucher.code}`}
                variant="secondary"
              >
                PDF laden
              </Button>
            ) : null}
          </div>

          {admin ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-forest)]/5 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    Admin-Aktionen
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Teil-Einloesungen sind noch nicht integriert. &quot;Eingeloest&quot;
                    markiert den Gutschein vollstaendig als verwendet.
                  </p>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-forest)]/70">
                  {admin.name}
                </p>
              </div>
              <form action={updateVoucherState} className="mt-4 flex flex-wrap gap-3">
                <input type="hidden" name="code" value={voucher.code} />
                <button
                  type="submit"
                  name="intent"
                  value="redeem"
                  className="rounded-full bg-[var(--color-ember)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                >
                  Als eingeloest markieren
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="activate"
                  className="rounded-full border border-[var(--color-forest)]/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-forest)]"
                >
                  Wieder aktiv setzen
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="expire"
                  className="rounded-full border border-amber-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700"
                >
                  Als abgelaufen markieren
                </button>
              </form>
            </div>
          ) : null}

          {!admin ? (
            <p className="text-xs text-[var(--color-muted)]">
              Fuer die Einloesung bitte im Admin anmelden.
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <Link href="/admin" className="text-sm font-semibold text-[var(--color-forest)]">
          Zum Admin
        </Link>
      </div>
    </div>
  );
}
