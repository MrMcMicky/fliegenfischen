"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { formatPrice } from "@/lib/format";
import { calculateLessonTotal, normalizePrice } from "@/lib/booking-utils";

const paymentOptions = [
  { value: "STRIPE", label: "Sofort bezahlen (TWINT / Karte)" },
  { value: "INVOICE", label: "Rechnung anfragen" },
] as const;

type BookingType = "COURSE" | "PRIVATE" | "TASTER" | "VOUCHER";

type BookingFormProps = {
  type: BookingType;
  initialVoucherAmount?: number;
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
    values: number[];
  };
};

export function BookingForm({
  type,
  session,
  lesson,
  voucherOption,
  initialVoucherAmount,
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
  const [voucherRecipient, setVoucherRecipient] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [paymentMode, setPaymentMode] = useState<"STRIPE" | "INVOICE">(
    "STRIPE"
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      return normalizePrice(voucherAmount);
    }
    return 0;
  }, [type, session, quantity, lesson, hours, additionalPeople, voucherAmount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

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
          },
          paymentMode,
          notes,
          voucherRecipient,
          voucherMessage,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Buchung fehlgeschlagen");
      }

      if (payload.url) {
        window.location.href = payload.url;
        return;
      }

      if (payload.invoice && payload.bookingId) {
        router.push(`/buchen/erfolg?bookingId=${payload.bookingId}`);
        return;
      }

      throw new Error("Unbekannte Antwort vom Server");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Buchung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Name
          </label>
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            placeholder="Vorname Nachname"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            E-Mail
          </label>
          <input
            required
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            placeholder="name@email.ch"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Telefon
          </label>
          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </div>
      </div>

      {type === "COURSE" && session ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm">
          <p className="font-semibold text-[var(--color-text)]">
            {session.course?.title}
          </p>
          <p className="text-[var(--color-muted)]">
            {session.date} · {session.startTime}-{session.endTime} · {session.location}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Teilnehmende
              </label>
              <input
                type="number"
                min={1}
                max={session.availableSpots}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="mt-2 w-24 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div className="text-sm text-[var(--color-muted)]">
              Noch {session.availableSpots} Plätze
            </div>
          </div>
        </div>
      ) : null}

      {(type === "PRIVATE" || type === "TASTER") && lesson ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm">
          <p className="font-semibold text-[var(--color-text)]">{lesson.title}</p>
          <p className="text-[var(--color-muted)]">{lesson.description}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Stunden
              </label>
              <input
                type="number"
                min={lesson.minHours}
                value={hours}
                onChange={(event) => setHours(Number(event.target.value))}
                className="mt-2 w-24 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Zusatzpersonen
              </label>
              <input
                type="number"
                min={0}
                value={additionalPeople}
                onChange={(event) => setAdditionalPeople(Number(event.target.value))}
                className="mt-2 w-24 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      ) : null}

      {type === "VOUCHER" && voucherOption ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm space-y-4">
          <div>
            <p className="font-semibold text-[var(--color-text)]">{voucherOption.title}</p>
            <p className="text-[var(--color-muted)]">{voucherOption.description}</p>
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
                />
                {formatPrice(value)}
              </label>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Empfänger (optional)
              </label>
              <input
                value={voucherRecipient}
                onChange={(event) => setVoucherRecipient(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
                Widmung (optional)
              </label>
              <input
                value={voucherMessage}
                onChange={(event) => setVoucherMessage(event.target.value)}
                className="mt-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              />
            </div>
          </div>
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
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
          Notizen (optional)
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          placeholder="Wunschdatum, Erfahrung, Ziel"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg font-semibold text-[var(--color-forest)]">
          Total {formatPrice(total)}
        </p>
        <Button type="submit" disabled={loading}>
          {loading ? "Senden..." : "Weiter"}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
