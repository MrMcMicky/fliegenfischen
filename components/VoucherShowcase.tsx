"use client";

import Image from "next/image";

import { Button } from "@/components/Button";
import voucherPreviewImage from "@/screenshots/Gutschein-Muster-16-9.jpg";

type VoucherOption = {
  id: string;
  title: string;
  description: string;
  values: number[];
  kind?: "COURSE" | "VALUE" | string;
};

type VoucherShowcaseProps = {
  voucherOptions: VoucherOption[];
};

export function VoucherShowcase({ voucherOptions }: VoucherShowcaseProps) {
  const courseVoucherOption =
    voucherOptions.find((option) => option.kind === "COURSE") || null;
  const valueVoucherOption =
    voucherOptions.find((option) => option.kind === "VALUE") || null;
  const chooserButtonClass =
    "min-w-[18rem] border-[var(--color-forest)] bg-[var(--color-forest)] px-7 py-3 text-base text-white shadow-[0_18px_40px_-20px_rgba(15,50,49,0.32)] hover:-translate-y-0.5 hover:border-[var(--color-forest)] hover:bg-[var(--color-forest)]/95 hover:text-white";

  return (
    <>
      <section className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white p-4 shadow-[0_24px_60px_-26px_rgba(15,50,49,0.28)] sm:p-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
          Gutschein-Vorschau
        </p>
        <div className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-stone)]">
          <Image
            src={voucherPreviewImage}
            alt="Beispiel eines Fliegenfischen-Geschenkgutscheins"
            className="h-auto w-full"
            priority
            sizes="(max-width: 1024px) 100vw, 960px"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-stone)] px-6 py-7">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
          Gutschein wählen
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {courseVoucherOption ? (
            <Button
              variant="secondary"
              size="lg"
              href={`/buchen?voucherOptionId=${courseVoucherOption.id}`}
              className={chooserButtonClass}
            >
              Kursgutschein bestellen
            </Button>
          ) : null}
          {valueVoucherOption ? (
            <Button
              variant="secondary"
              size="lg"
              href={`/buchen?voucherOptionId=${valueVoucherOption.id}`}
              className={chooserButtonClass}
            >
              Wertgutschein bestellen
            </Button>
          ) : null}
        </div>
      </section>
    </>
  );
}
