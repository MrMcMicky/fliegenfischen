"use client";

import { useEffect, useState } from "react";

type ConfirmResponse = {
  ok: boolean;
  status?: string;
  voucherCode?: string | null;
};

export function CheckoutSuccessClient({ bookingId }: { bookingId: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);

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
      <p>{status === "paid" ? "Bezahlt" : "Zahlung wird bestaetigt"}</p>
      {voucherCode ? (
        <div className="mt-4">
          <p className="font-semibold text-[var(--color-text)]">Gutschein-Code</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-forest)]">
            {voucherCode}
          </p>
        </div>
      ) : null}
    </div>
  );
}
