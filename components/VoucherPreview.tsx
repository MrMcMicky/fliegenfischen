import Image from "next/image";
import type { VoucherDeliveryMethod } from "@prisma/client";

import voucherBlankImage from "@/screenshots/Gutschein-Muster-leer-A5.jpg";
import { formatPrice } from "@/lib/format";
import {
  getVoucherDeliverySummary,
  getVoucherPreviewMessage,
  getVoucherPreviewRecipient,
} from "@/lib/vouchers";

type VoucherPreviewProps = {
  title: string;
  amountCHF: number;
  recipientName?: string | null;
  message?: string | null;
  code?: string | null;
  deliveryMethod?: VoucherDeliveryMethod | null;
  className?: string;
};

export function VoucherPreview({
  title,
  amountCHF,
  recipientName,
  message,
  code,
  deliveryMethod,
  className = "",
}: VoucherPreviewProps) {
  const resolvedRecipient = getVoucherPreviewRecipient(recipientName);
  const resolvedMessage = getVoucherPreviewMessage(message);
  const resolvedCode = code?.trim() ? `ID ${code}` : "ID nach Zahlung";

  return (
    <div
      className={`relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-white shadow-[0_20px_45px_rgba(15,50,49,0.12)] ${className}`}
    >
      <Image
        src={voucherBlankImage}
        alt="Gutschein-Vorschau"
        fill
        sizes="(max-width: 1024px) 100vw, 420px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5" />

      <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-forest)] shadow-sm">
        {getVoucherDeliverySummary(deliveryMethod)}
      </div>

      <div className="absolute inset-x-[16%] top-[40%] text-center">
        <div className="font-serif text-[clamp(1.15rem,2vw,2rem)] italic text-[var(--color-forest)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.75)]">
          {resolvedRecipient}
        </div>
      </div>

      <div className="absolute inset-x-[13%] top-[67%] text-center text-[var(--color-forest)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] sm:text-[12px]">
          {title}
        </div>
        <div className="mt-1 text-xl font-semibold sm:text-2xl">
          {formatPrice(amountCHF)}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div className="max-w-[68%] rounded-2xl bg-[var(--color-forest)]/88 px-4 py-3 text-white shadow-lg backdrop-blur-[2px]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
            Widmung
          </div>
          <div className="mt-1 line-clamp-2 text-sm leading-5">{resolvedMessage}</div>
        </div>
        <div className="shrink-0 rounded-2xl bg-white/92 px-3 py-2 text-right shadow-lg">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Gutschein
          </div>
          <div className="mt-1 text-xs font-semibold text-[var(--color-forest)]">
            {resolvedCode}
          </div>
        </div>
      </div>
    </div>
  );
}
