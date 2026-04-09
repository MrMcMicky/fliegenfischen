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
  const previewMessage =
    resolvedMessage === "Persoenliche Widmung" ? "" : resolvedMessage;

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
      <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-white/6" />

      <div className="absolute right-[7.5%] top-[10.5%] text-[0.34rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-forest)]/80 sm:text-[0.42rem]">
        {getVoucherDeliverySummary(deliveryMethod)}
      </div>

      <div className="absolute inset-x-[22%] top-[41.5%] text-center">
        <div className="font-serif text-[clamp(0.88rem,1.6vw,1.45rem)] italic leading-none text-[var(--color-forest)] [text-shadow:0_1px_1px_rgba(255,255,255,0.7)]">
          {resolvedRecipient}
        </div>
      </div>

      <div className="absolute inset-x-[18%] top-[74.2%] text-center text-[var(--color-forest)]">
        <div className="text-[0.34rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.42rem]">
          {title}
        </div>
        <div className="mt-0.5 text-[0.78rem] font-semibold sm:text-[1.05rem]">
          {formatPrice(amountCHF)}
        </div>
      </div>

      {previewMessage ? (
        <div className="absolute inset-x-[22%] bottom-[13.2%] text-center text-[0.38rem] leading-tight text-[var(--color-forest)]/82 sm:text-[0.48rem]">
          {previewMessage}
        </div>
      ) : null}

      <div className="absolute bottom-[10.5%] right-[9%] text-right text-[0.3rem] uppercase tracking-[0.14em] text-[var(--color-forest)]/78 sm:text-[0.38rem]">
        {resolvedCode}
      </div>
    </div>
  );
}
