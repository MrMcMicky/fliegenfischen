export const bookingTypeLabels: Record<string, string> = {
  COURSE: "Kurs",
  PRIVATE: "Privatunterricht",
  TASTER: "Schnupperstunden",
  VOUCHER: "Gutschein",
};

export const bookingStatusLabels: Record<string, string> = {
  PENDING: "Offen",
  PAYMENT_PENDING: "Zahlung offen",
  PAID: "Bezahlt",
  INVOICE_REQUESTED: "Rechnung angefragt",
  CANCELLED: "Storniert",
};

export const paymentStatusLabels: Record<string, string> = {
  PENDING: "Offen",
  PAID: "Bezahlt",
  FAILED: "Fehlgeschlagen",
};
