import type { VoucherDeliveryMethod, VoucherStatus } from "@prisma/client";

import { env } from "@/lib/env";

export const VOUCHER_PRINT_SURCHARGE_CHF = 5;

export const voucherStatusLabels: Record<VoucherStatus, string> = {
  ACTIVE: "Aktiv",
  REDEEMED: "Eingeloest",
  EXPIRED: "Abgelaufen",
};

export const voucherDeliveryMethodLabels: Record<VoucherDeliveryMethod, string> =
  {
    EMAIL: "PDF per E-Mail",
    POSTAL: "PDF per E-Mail + gedruckt per Post",
  };

export const normalizeVoucherCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const buildVoucherVerificationPath = (code: string) =>
  `/gutscheine/pruefen?code=${encodeURIComponent(normalizeVoucherCode(code))}`;

export const buildVoucherVerificationUrl = (code: string) =>
  `${env.appUrl}${buildVoucherVerificationPath(code)}`;

export const getVoucherPreviewRecipient = (value?: string | null) =>
  value?.trim() || "Name des Beschenkten";

export const getVoucherPreviewMessage = (value?: string | null) =>
  value?.trim() || "Persoenliche Widmung";

export const getVoucherDeliverySummary = (
  deliveryMethod?: VoucherDeliveryMethod | null
) =>
  voucherDeliveryMethodLabels[deliveryMethod || "EMAIL"];
