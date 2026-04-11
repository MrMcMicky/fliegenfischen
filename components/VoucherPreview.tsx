import Image from "next/image";
import type { VoucherDeliveryMethod, VoucherKind } from "@prisma/client";

import { formatPrice } from "@/lib/format";
import {
  getVoucherPreviewBackgroundSrc,
  getVoucherPreviewMessage,
  getVoucherPreviewRecipient,
  getVoucherPreviewDeliverySummary,
} from "@/lib/vouchers";

type VoucherPreviewProps = {
  title: string;
  kind?: VoucherKind | null;
  amountCHF: number;
  recipientName?: string | null;
  message?: string | null;
  code?: string | null;
  deliveryMethod?: VoucherDeliveryMethod | null;
  className?: string;
};

export function VoucherPreview({
  title,
  kind,
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
  const recipientFontClamp =
    resolvedRecipient.length > 30
      ? "clamp(0.66rem, 1.08vw, 0.9rem)"
      : resolvedRecipient.length > 24
        ? "clamp(0.74rem, 1.22vw, 1rem)"
        : resolvedRecipient.length > 18
          ? "clamp(0.82rem, 1.34vw, 1.12rem)"
          : "clamp(0.9rem, 1.46vw, 1.24rem)";
  const messageFontClamp =
    previewMessage.length > 36
      ? "clamp(0.36rem, 0.68vw, 0.52rem)"
      : "clamp(0.4rem, 0.76vw, 0.58rem)";

  return (
    <div
      className={`relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-white shadow-[0_20px_45px_rgba(15,50,49,0.12)] ${className}`}
    >
      <Image
        src={getVoucherPreviewBackgroundSrc(kind, title)}
        alt={`Gutschein-Vorschau ${title}`}
        fill
        sizes="(max-width: 1024px) 100vw, 420px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/4 via-transparent to-white/6" />

      <div className="absolute right-[7.5%] top-[10.5%] text-[0.34rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-forest)]/80 sm:text-[0.42rem]">
        {getVoucherPreviewDeliverySummary(deliveryMethod)}
      </div>

      <div className="absolute inset-x-[13%] top-[49.2%] text-center">
        <div
          className="whitespace-nowrap font-serif italic leading-none text-[var(--color-forest)] [text-shadow:0_1px_1px_rgba(255,255,255,0.72)]"
          style={{ fontSize: recipientFontClamp }}
        >
          {resolvedRecipient}
        </div>
      </div>

      {previewMessage ? (
        <div
          className="absolute inset-x-[18%] top-[64.2%] text-center italic leading-tight text-[var(--color-forest)]/82"
          style={{ fontSize: messageFontClamp }}
        >
          {previewMessage}
        </div>
      ) : null}

      <div className="absolute inset-x-[16%] top-[72.4%] text-center text-[var(--color-forest)]">
        <div className="text-[0.34rem] font-semibold uppercase tracking-[0.18em] sm:text-[0.42rem]">
          Im Wert von
        </div>
        <div className="mt-0.5 text-[0.76rem] font-semibold sm:text-[1.02rem]">
          {formatPrice(amountCHF)}
        </div>
      </div>

      <div className="absolute bottom-[10.5%] right-[9%] text-right text-[0.3rem] uppercase tracking-[0.14em] text-[var(--color-forest)]/78 sm:text-[0.38rem]">
        {resolvedCode}
      </div>
    </div>
  );
}
