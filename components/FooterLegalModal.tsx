"use client";

import { useEffect, useState } from "react";

import type { LegalContent as LegalContentType } from "@/lib/legal";
import { LegalContent } from "@/components/LegalContent";

export function FooterLegalModal({
  label,
  content,
}: {
  label: string;
  content: LegalContentType;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left text-white/80 hover:text-white"
      >
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-10 mx-auto w-[min(720px,92vw)] rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Rechtliches
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--color-text)]">
                  Datenschutz, Impressum & Hinweise
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text)]"
              >
                Schliessen
              </button>
            </div>
            <div className="mt-6 max-h-[70vh] overflow-y-auto pr-1">
              <LegalContent content={content} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
