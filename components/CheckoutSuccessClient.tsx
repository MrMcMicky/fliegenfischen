"use client";

import { useEffect, useState } from "react";

import { voucherDeliveryMethodLabels } from "@/lib/vouchers";

type ConfirmResponse = {
  ok: boolean;
  status?: string;
  voucherCode?: string | null;
  voucherDeliveryMethod?: "EMAIL" | "POSTAL" | null;
};

export function CheckoutSuccessClient({
  bookingId,
  initialVoucherCode = null,
  initialVoucherDeliveryMethod = null,
}: {
  bookingId: string;
  initialVoucherCode?: string | null;
  initialVoucherDeliveryMethod?: "EMAIL" | "POSTAL" | null;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string | null>(initialVoucherCode);
  const [voucherDeliveryMethod, setVoucherDeliveryMethod] = useState<
    "EMAIL" | "POSTAL" | null
  >(initialVoucherDeliveryMethod);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const response = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
        const payload = (await response.json()) as ConfirmResponse;
        if (!active) return;
        if (payload.ok) {
          setStatus(payload.status || null);
          if (payload.voucherCode) {
            setVoucherCode(payload.voucherCode);
          }
          if (payload.voucherDeliveryMethod) {
            setVoucherDeliveryMethod(payload.voucherDeliveryMethod);
          }
        }
      } catch {
        if (!active) return;
        setStatus("processing");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [bookingId]);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-muted)]">
      <p className="font-semibold text-[var(--color-text)]">Status</p>
      <p>{status === "paid" ? "Bezahlt" : "Zahlung wird bestätigt"}</p>
      {voucherCode ? (
        <div className="mt-4">
          <p className="font-semibold text-[var(--color-text)]">Gutschein-Code</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-forest)]">
            {voucherCode}
          </p>
          {voucherDeliveryMethod ? (
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Zustellung: {voucherDeliveryMethodLabels[voucherDeliveryMethod]}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`/api/voucher/pdf?code=${voucherCode}`}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-forest)]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]"
            >
              Gutschein PDF herunterladen
            </a>
            <a
              href={`/gutscheine/pruefen?code=${encodeURIComponent(voucherCode)}`}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-forest)]/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]"
            >
              Gutschein pruefen
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
