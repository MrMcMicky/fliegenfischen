"use client";

import { startTransition, useMemo, useState } from "react";
import type { VoucherDeliveryMethod, VoucherKind } from "@prisma/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CalendarDays, MapPin, Users, Clock, Gift } from "lucide-react";

import { Button } from "@/components/Button";
import { VoucherPreview } from "@/components/VoucherPreview";
import { dispatchBrowserAnalyticsEvent } from "@/lib/browser-analytics";
import { formatDate, formatPrice } from "@/lib/format";
import { calculateLessonTotal, normalizePrice } from "@/lib/booking-utils";
import {
  getVoucherDeliverySummary,
  VOUCHER_PRINT_SURCHARGE_CHF,
} from "@/lib/vouchers";

const paymentOptions = [
  { value: "STRIPE", label: "Sofort bezahlen (TWINT / Karte)" },
  { value: "INVOICE", label: "Rechnung anfragen" },
] as const;

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Bitte fülle Name und E-Mail aus.",
  missing_session: "Der Kurs ist nicht mehr verfügbar.",
  session_not_found: "Der Kurs wurde nicht gefunden.",
  not_enough_spots: "Für den Kurs sind nicht genug Plätze verfügbar.",
  lesson_not_found: "Die Privatlektion wurde nicht gefunden.",
  missing_voucher: "Bitte wähle einen Gutschein.",
  voucher_not_found: "Dieser Gutschein ist nicht verfügbar.",
  invalid_voucher_amount: "Bitte wähle einen gültigen Gutscheinbetrag.",
  invalid_amount: "Der Betrag ist ungültig.",
  missing_postal_address: "Bitte gib die Versandadresse für den Postversand an.",
  use_invoice_checkout:
    "Bitte wähle die Option Rechnung anfragen, um fortzufahren.",
  use_stripe_checkout:
    "Bitte wähle die Option Sofort bezahlen, um fortzufahren.",
  missing_stripe:
    "Die Onlinezahlung ist aktuell nicht verfügbar. Bitte wähle Rechnung anfragen.",
  stripe_checkout_failed:
    "Die Onlinezahlung konnte nicht gestartet werden. Bitte versuche es erneut oder wähle Rechnung anfragen.",
  checkout_failed:
    "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.",
};

const getErrorMessage = (code?: string) =>
  (code && ERROR_MESSAGES[code]) ||
  "Buchung fehlgeschlagen. Bitte versuche es erneut.";

const MAX_TWO_DIGIT_VALUE = 99;

const clampInteger = (value: number, min: number, max?: number) => {
  if (!Number.isFinite(value)) return min;

  const normalized = Math.trunc(value);
  if (typeof max === "number") {
    return Math.min(max, Math.max(min, normalized));
  }

  return Math.max(min, normalized);
};

type BookingType = "COURSE" | "PRIVATE" | "TASTER" | "VOUCHER";

type BookingFormProps = {
  type: BookingType;
  initialVoucherAmount?: number;
  voucherTestPaymentBypass?: boolean;
  session?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    priceCHF: number;
    availableSpots: number;
    course: { title: string } | null;
  };
  lesson?: {
    type: "PRIVATE" | "TASTER";
    title: string;
    description: string;
    priceCHF: number;
    minHours: number;
    additionalPersonCHF: number;
  };
  voucherOption?: {
    id: string;
    title: string;
    description: string;
    kind: VoucherKind;
    values: number[];
  };
};

export function BookingForm({
  type,
  session,
  lesson,
  voucherOption,
  initialVoucherAmount,
  voucherTestPaymentBypass = false,
}: BookingFormProps) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [hours, setHours] = useState(lesson?.minHours ?? 2);
  const [additionalPeople, setAdditionalPeople] = useState(0);
  const initialVoucherAmountValue =
    voucherOption && voucherOption.values.length > 0
      ? voucherOption.values.includes(initialVoucherAmount ?? -1)
        ? (initialVoucherAmount as number)
        : voucherOption.values[0]
      : 0;
  const [voucherAmount, setVoucherAmount] = useState(
    initialVoucherAmountValue
  );
  const [voucherDeliveryMethod, setVoucherDeliveryMethod] =
    useState<VoucherDeliveryMethod>("EMAIL");
  const [voucherRecipient, setVoucherRecipient] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [customerAddressLine1, setCustomerAddressLine1] = useState("");
  const [customerAddressLine2, setCustomerAddressLine2] = useState("");
  const [customerPostalCode, setCustomerPostalCode] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerCountry, setCustomerCountry] = useState("Schweiz");
  const [paymentMode, setPaymentMode] = useState<"STRIPE" | "INVOICE">(
    "STRIPE"
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const showPostalFields =
    type === "VOUCHER" && voucherDeliveryMethod === "POSTAL";
  const isVoucherBooking = type === "VOUCHER" && Boolean(voucherOption);
  const voucherShippingCHF = showPostalFields ? VOUCHER_PRINT_SURCHARGE_CHF : 0;

  const summary = useMemo(() => {
    if (type === "COURSE" && session) {
      return {
        title: session.course?.title ?? "Kurs",
        image:
          session.course?.title?.toLowerCase().includes("zweihand")
            ? "/illustrations/course-zweihand-v3.png"
            : "/illustrations/course-einhand-v2.png",
        meta: [
          {
            icon: CalendarDays,
            value: `${formatDate(session.date)} · ${session.startTime}-${session.endTime}`,
          },
          { icon: MapPin, value: session.location },
          { icon: Users, value: `${quantity} Teilnehmende` },
        ],
        rows: [
          {
            label: "Termin",
            value: `${formatDate(session.date)} · ${session.startTime}-${session.endTime}`,
          },
          { label: "Ort", value: session.location },
          {
            label: "Preis",
            value: `${formatPrice(session.priceCHF)} pro Person`,
          },
          { label: "Teilnehmende", value: String(quantity) },
        ],
      };
    }
    if ((type === "PRIVATE" || type === "TASTER") && lesson) {
      return {
        title: lesson.title,
        image: "/illustrations/private-lessons.png",
        meta: [
          { icon: Clock, value: `${hours} Stunden` },
          { icon: Users, value: `${1 + additionalPeople} Teilnehmende` },
        ],
        rows: [
          { label: "Dauer", value: `${hours} Stunden` },
          { label: "Teilnehmende", value: String(1 + additionalPeople) },
          { label: "Preis", value: `${formatPrice(lesson.priceCHF)} / Std.` },
        ],
      };
    }
    if (type === "VOUCHER" && voucherOption) {
      return {
        title: voucherOption.title,
        image: null,
        meta: [
          {
            icon: Gift,
            value: `Im Wert von ${formatPrice(normalizePrice(voucherAmount))}`,
          },
          {
            icon: Gift,
            value: getVoucherDeliverySummary(voucherDeliveryMethod),
          },
        ],
        rows: [
          {
            label: "Gutscheinwert",
            value: formatPrice(normalizePrice(voucherAmount)),
          },
          voucherShippingCHF
            ? {
                label: "Druck & Versand",
                value: formatPrice(voucherShippingCHF),
              }
            : null,
          {
            label: "Zustellung",
            value: getVoucherDeliverySummary(voucherDeliveryMethod),
          },
          voucherRecipient
            ? { label: "Empfänger", value: voucherRecipient }
            : null,
          voucherMessage ? { label: "Widmung", value: voucherMessage } : null,
        ].filter(Boolean) as { label: string; value: string }[],
      };
    }
    return null;
  }, [
    type,
    session,
    lesson,
    voucherOption,
    voucherAmount,
    voucherDeliveryMethod,
    voucherShippingCHF,
    voucherRecipient,
    voucherMessage,
    quantity,
    hours,
    additionalPeople,
  ]);

  const total = useMemo(() => {
    if (type === "COURSE" && session) {
      return session.priceCHF * quantity;
    }
    if ((type === "PRIVATE" || type === "TASTER") && lesson) {
      return calculateLessonTotal(
        lesson.priceCHF,
        hours,
        lesson.additionalPersonCHF,
        additionalPeople
      );
    }
    if (type === "VOUCHER") {
      return normalizePrice(voucherAmount) + voucherShippingCHF;
    }
    return 0;
  }, [
    type,
    session,
    quantity,
    lesson,
    hours,
    additionalPeople,
    voucherAmount,
    voucherShippingCHF,
  ]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setRedirecting(false);

    try {
      const endpoint =
        paymentMode === "STRIPE" ? "/api/stripe/checkout" : "/api/checkout";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          sessionId: session?.id,
          lessonType: lesson?.type,
          voucherOptionId: voucherOption?.id,
          voucherAmount,
          quantity,
          hours,
          additionalPeople,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            addressLine1: showPostalFields ? customerAddressLine1 : "",
            addressLine2: showPostalFields ? customerAddressLine2 : "",
            postalCode: showPostalFields ? customerPostalCode : "",
            city: showPostalFields ? customerCity : "",
            country: showPostalFields ? customerCountry : "",
          },
          paymentMode,
          notes,
          voucherDeliveryMethod,
          voucherRecipient,
          voucherMessage,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "booking_failed");
      }

      dispatchBrowserAnalyticsEvent({
        eventType:
          paymentMode === "STRIPE" ? "checkout_started" : "invoice_requested",
        label: summary?.title || type,
        path:
          typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : "/buchen",
        metadata: {
          bookingType: type,
          paymentMode,
          quantity,
          hours,
          additionalPeople,
          totalChf: total,
        },
      });

      if (payload.url) {
        const currentOrigin =
          typeof window !== "undefined" ? window.location.origin : "";
        const resolvedUrl = new URL(payload.url, currentOrigin || undefined);
        const isInternalNavigation =
          Boolean(currentOrigin) && resolvedUrl.origin === currentOrigin;

        setRedirecting(true);

        if (isInternalNavigation) {
          const nextPath = `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
          startTransition(() => {
            router.push(nextPath);
          });
        } else if (typeof window !== "undefined") {
          window.location.href = payload.url;
        }
        return;
      }

      if (payload.invoice && payload.bookingId) {
        router.push(`/buchen/erfolg?bookingId=${payload.bookingId}`);
        return;
      }

      throw new Error("Unbekannte Antwort vom Server");
    } catch (err) {
      const code = err instanceof Error ? err.message : undefined;
      setRedirecting(false);
      setError(getErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm transition focus:border-[var(--color-ember)] focus:outline-none focus:ring-4 focus:ring-[var(--color-ember)]/20";
  const labelClass = "text-sm font-semibold text-slate-700";
  const fieldClass = "space-y-1";
  const isBusy = loading || redirecting;
  const submitLabel =
    type === "VOUCHER" &&
    voucherTestPaymentBypass &&
    paymentMode === "STRIPE"
      ? "Testzahlung abschliessen"
      : "Weiter";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {redirecting ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-white/78 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-white px-6 py-8 text-center shadow-[0_25px_60px_rgba(15,50,49,0.14)]">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--color-forest)]/60">
              Bestellung
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--color-text)]">
              Bestellung wird abgeschlossen
            </h2>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Zahlung, Gutschein und Bestätigung werden vorbereitet. Du wirst
              sofort weitergeleitet.
            </p>
          </div>
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 space-y-4">
            <div>
              <p className="font-semibold text-[var(--color-text)]">
                {isVoucherBooking ? "Auftraggeber" : "Kontaktdaten"}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Pflichtfelder sind mit * markiert.
              </p>
            </div>
            <div
              className={
                isVoucherBooking
                  ? "grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)]"
                  : "grid gap-4 md:grid-cols-2"
              }
            >
              <div className={fieldClass}>
                <label className={labelClass}>Name*</label>
                <input
                  required
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  disabled={isBusy}
                  className={inputClass}
                  placeholder="Vorname Nachname"
                />
              </div>
              <div className={fieldClass}>
                <label className={labelClass}>E-Mail*</label>
                <input
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  disabled={isBusy}
                  className={inputClass}
                  placeholder="name@email.ch"
                />
              </div>
              <div className={fieldClass}>
                <label className={labelClass}>Telefon</label>
                <input
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  disabled={isBusy}
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {type === "COURSE" && session ? (
            <div className={fieldClass}>
              <label className={labelClass}>Anzahl Teilnehmende</label>
              <input
                type="number"
                min={1}
                max={Math.min(session.availableSpots, MAX_TWO_DIGIT_VALUE)}
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    clampInteger(
                      Number(event.target.value),
                      1,
                      Math.min(session.availableSpots, MAX_TWO_DIGIT_VALUE)
                    )
                  )
                }
                onBlur={(event) =>
                  setQuantity(
                    clampInteger(
                      Number(event.target.value),
                      1,
                      Math.min(session.availableSpots, MAX_TWO_DIGIT_VALUE)
                    )
                  )
                }
                disabled={isBusy}
                className={`${inputClass} w-32 text-center`}
                step={1}
                inputMode="numeric"
              />
              <p className="text-xs text-slate-500">
                Noch {session.availableSpots} Plätze verfügbar
              </p>
            </div>
          ) : null}

          {(type === "PRIVATE" || type === "TASTER") && lesson ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className={fieldClass}>
                  <label className={labelClass}>Stunden</label>
                  <input
                    type="number"
                    min={lesson.minHours}
                    max={MAX_TWO_DIGIT_VALUE}
                    value={hours}
                    onChange={(event) =>
                      setHours(
                        clampInteger(
                          Number(event.target.value),
                          lesson.minHours,
                          MAX_TWO_DIGIT_VALUE
                        )
                      )
                    }
                    onBlur={(event) =>
                      setHours(
                        clampInteger(
                          Number(event.target.value),
                          lesson.minHours,
                          MAX_TWO_DIGIT_VALUE
                        )
                      )
                    }
                    disabled={isBusy}
                    className={`${inputClass} w-28`}
                    step={1}
                    inputMode="numeric"
                  />
                  <p className="text-xs text-slate-500">
                    {lesson.minHours}h sind das Minimum.
                  </p>
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>Zusatzpersonen</label>
                  <input
                    type="number"
                    min={0}
                    max={MAX_TWO_DIGIT_VALUE}
                    value={additionalPeople}
                    onChange={(event) =>
                      setAdditionalPeople(
                        clampInteger(
                          Number(event.target.value),
                          0,
                          MAX_TWO_DIGIT_VALUE
                        )
                      )
                    }
                    onBlur={(event) =>
                      setAdditionalPeople(
                        clampInteger(
                          Number(event.target.value),
                          0,
                          MAX_TWO_DIGIT_VALUE
                        )
                      )
                    }
                    disabled={isBusy}
                    className={`${inputClass} w-28`}
                    step={1}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {type === "VOUCHER" && voucherOption ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 space-y-4">
              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  Wert
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {voucherOption.values.map((value) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold text-[var(--color-forest)]"
                  >
                    <input
                      type="radio"
                      name="voucherAmount"
                      value={value}
                      checked={voucherAmount === value}
                      onChange={() => setVoucherAmount(value)}
                      disabled={isBusy}
                    />
                    {formatPrice(value)}
                  </label>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={fieldClass}>
                  <label className={labelClass}>Empfänger (optional)</label>
                  <input
                    value={voucherRecipient}
                    onChange={(event) => setVoucherRecipient(event.target.value)}
                    disabled={isBusy}
                    className={inputClass}
                  />
                </div>
                <div className={fieldClass}>
                  <label className={labelClass}>Widmung (optional)</label>
                  <input
                    value={voucherMessage}
                    onChange={(event) => setVoucherMessage(event.target.value)}
                    disabled={isBusy}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-stone)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Zustellung
                </p>
                <div className="mt-3 space-y-2 text-sm text-[var(--color-text)]">
                  <label className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3">
                    <input
                      type="radio"
                      name="voucherDeliveryMethod"
                      value="EMAIL"
                      checked={voucherDeliveryMethod === "EMAIL"}
                      onChange={() => setVoucherDeliveryMethod("EMAIL")}
                      disabled={isBusy}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-semibold">PDF per E-Mail</span>
                      <span className="block text-xs text-[var(--color-muted)]">
                        Download nach Zahlung und PDF direkt per E-Mail.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3">
                    <input
                      type="radio"
                      name="voucherDeliveryMethod"
                      value="POSTAL"
                      checked={voucherDeliveryMethod === "POSTAL"}
                      onChange={() => setVoucherDeliveryMethod("POSTAL")}
                      disabled={isBusy}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-semibold">
                        Gedruckt per Post (+ {formatPrice(VOUCHER_PRINT_SURCHARGE_CHF)})
                      </span>
                      <span className="block text-xs text-[var(--color-muted)]">
                        Zusätzlich zum PDF versenden wir den Gutschein gedruckt per Post.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              {showPostalFields ? (
                <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4">
                  <div className="mb-4">
                    <p className="font-semibold text-[var(--color-text)]">
                      Versandadresse
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Der Versand erfolgt an dich als Besteller. Pflichtfelder sind markiert.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className={`${fieldClass} md:col-span-2`}>
                      <label className={labelClass}>Strasse und Nr.*</label>
                      <input
                        required={showPostalFields}
                        value={customerAddressLine1}
                        onChange={(event) =>
                          setCustomerAddressLine1(event.target.value)
                        }
                        disabled={isBusy}
                        className={inputClass}
                      />
                    </div>
                    <div className={`${fieldClass} md:col-span-2`}>
                      <label className={labelClass}>Adresszusatz</label>
                      <input
                        value={customerAddressLine2}
                        onChange={(event) =>
                          setCustomerAddressLine2(event.target.value)
                        }
                        disabled={isBusy}
                        className={inputClass}
                        placeholder="Optional"
                      />
                    </div>
                    <div className={fieldClass}>
                      <label className={labelClass}>PLZ*</label>
                      <input
                        required={showPostalFields}
                        value={customerPostalCode}
                        onChange={(event) =>
                          setCustomerPostalCode(event.target.value)
                        }
                        disabled={isBusy}
                        className={inputClass}
                      />
                    </div>
                    <div className={fieldClass}>
                      <label className={labelClass}>Ort*</label>
                      <input
                        required={showPostalFields}
                        value={customerCity}
                        onChange={(event) => setCustomerCity(event.target.value)}
                        disabled={isBusy}
                        className={inputClass}
                      />
                    </div>
                    <div className={`${fieldClass} md:col-span-2`}>
                      <label className={labelClass}>Land</label>
                      <input
                        value={customerCountry}
                        onChange={(event) =>
                          setCustomerCountry(event.target.value)
                        }
                        disabled={isBusy}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              Zahlungsart
            </p>
            <div className="mt-3 space-y-2 text-sm">
              {paymentOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMode"
                    value={option.value}
                    checked={paymentMode === option.value}
                    onChange={() => setPaymentMode(option.value)}
                    disabled={isBusy}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              {type === "VOUCHER" && voucherTestPaymentBypass
                ? "Testmodus aktiv: Beim Weitergehen wird Stripe fuer Gutscheine uebersprungen und die Zahlung direkt als bezahlt markiert. Mailversand, PDF-Download und Gutschein-Erstellung laufen normal weiter."
                : "Sofortzahlung via Stripe (TWINT, Visa, Mastercard). Bei Rechnung schicken wir dir die Zahlungsdetails per E-Mail. Die Platzreservation ist erst nach Zahlungseingang gültig."}
            </p>
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>Notizen (optional)</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              disabled={isBusy}
              className={`${inputClass} min-h-[120px]`}
              placeholder="Wunschdatum, Erfahrung, Ziel"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}
        </div>
        <aside>
          {summary ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Zusammenfassung
              </p>
              {summary.image ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)]">
                  <Image
                    src={summary.image}
                    alt={summary.title}
                    width={640}
                    height={360}
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : null}
              {type === "VOUCHER" && voucherOption ? (
                <VoucherPreview
                  title={voucherOption.title}
                  kind={voucherOption.kind}
                  amountCHF={normalizePrice(voucherAmount)}
                  recipientName={voucherRecipient}
                  message={voucherMessage}
                  deliveryMethod={voucherDeliveryMethod}
                  className="mt-4"
                />
              ) : null}
              <p className="mt-4 text-lg font-semibold text-[var(--color-forest)]">
                {summary.title}
              </p>
              {summary.meta ? (
                <div className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                  {summary.meta.map((row) => {
                    const Icon = row.icon;
                    return (
                      <div key={row.value} className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 text-[var(--color-ember)]" />
                        <span>{row.value}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {summary.rows?.length ? (
                <div className="mt-4 space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)]/65 p-4 text-sm">
                  {summary.rows.map((row) => (
                    <div
                      key={`${row.label}-${row.value}`}
                      className="flex items-start justify-between gap-4"
                    >
                      <span className="text-[var(--color-muted)]">{row.label}</span>
                      <span className="text-right font-medium text-[var(--color-text)]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-6 border-t border-dashed border-[var(--color-border)] pt-4">
                <div className="flex items-end justify-between gap-3">
                  <span className="text-sm text-[var(--color-muted)]">
                    Total
                  </span>
                  <span className="text-3xl font-semibold text-[var(--color-forest)]">
                    {formatPrice(total)}
                  </span>
                </div>
                {type === "COURSE" && session ? (
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    {formatPrice(session.priceCHF)} pro Person
                  </p>
                ) : null}
                {type === "VOUCHER" && voucherShippingCHF > 0 ? (
                  <p className="mt-2 text-xs text-[var(--color-muted)]">
                    Inklusive Druck & Versand {formatPrice(voucherShippingCHF)}
                  </p>
                ) : null}
              </div>
              <div className="mt-6">
                <Button type="submit" disabled={isBusy} className="w-full">
                  {loading ? "Senden..." : redirecting ? "Weiterleiten..." : submitLabel}
                </Button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
