"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/format";

type VoucherOption = {
  id: string;
  title: string;
  description: string;
  values: number[];
};

type VoucherOptionCardProps = {
  option: VoucherOption;
};

export function VoucherOptionCard({ option }: VoucherOptionCardProps) {
  const values = useMemo(
    () => [...option.values].sort((a, b) => a - b),
    [option.values]
  );
  const [selected, setSelected] = useState(values[0] ?? 0);
  const href = selected
    ? `/buchen?voucherOptionId=${option.id}&voucherAmount=${selected}`
    : `/buchen?voucherOptionId=${option.id}`;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
      <h3 className="font-display text-2xl font-semibold text-[var(--color-text)]">
        {option.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        {option.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {values.map((value) => {
          const isActive = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border-[var(--color-forest)] bg-[var(--color-forest)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-stone)] text-[var(--color-forest)] hover:border-[var(--color-forest)]/60"
              }`}
            >
              {formatPrice(value)}
            </button>
          );
        })}
      </div>
      <div className="mt-6">
        <Button href={href} variant="secondary">
          Gutschein bestellen
        </Button>
      </div>
    </div>
  );
}
