"use client";

import { useActionState } from "react";

import { submitContact } from "@/app/kontakt/actions";
import { Button } from "@/components/Button";

const initialState = {
  status: "idle" as const,
  message: "",
};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="hidden">
        <label htmlFor="company">Firma</label>
        <input id="company" name="company" type="text" tabIndex={-1} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
            placeholder="Vorname Nachname"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            E-Mail
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
            placeholder="name@email.ch"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Telefon
          </label>
          <input
            name="phone"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            Betreff
          </label>
          <input
            name="subject"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
            placeholder="z.B. Schnupperstunde"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
          Nachricht
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
          placeholder="Kurz beschreiben, welches Ziel oder Datum dich interessiert."
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Senden..." : "Anfrage senden"}
        </Button>
        <p className="text-xs text-white/70">
          Antwort in der Regel innert 48 Stunden.
        </p>
      </div>
      {state.message ? (
        <p
          className={`text-sm ${
            state.status === "success" ? "text-emerald-200" : "text-orange-200"
          }`}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
