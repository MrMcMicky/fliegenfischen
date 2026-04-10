import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingForm } from "@/components/BookingForm";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Buchung",
    description: "Kurs oder Gutschein buchen.",
    path: "/buchen",
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

function BookingPageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-forest)]/60">
          <li className="flex items-center gap-2">
            <Link href="/" className="transition hover:text-[var(--color-forest)]">
              Startseite
            </Link>
            <span className="text-[var(--color-muted)]">/</span>
          </li>
          <li className="flex items-center gap-2">
            <Link
              href="/#kurse"
              className="transition hover:text-[var(--color-forest)]"
            >
              Kurse
            </Link>
            <span className="text-[var(--color-muted)]">/</span>
          </li>
          <li>
            <span className="text-[var(--color-text)]">Buchung</span>
          </li>
        </ol>
      </nav>
      <h1 className="whitespace-pre-line font-display text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-base text-[var(--color-muted)] sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: {
    sessionId?: string;
    lesson?: string;
    voucherOptionId?: string;
    voucherAmount?: string;
  };
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const params =
    resolvedParams && typeof (resolvedParams as { get?: unknown }).get === "function"
      ? Object.fromEntries(
          (resolvedParams as URLSearchParams).entries()
        )
      : (resolvedParams ?? {});

  const { sessionId, lesson, voucherOptionId, voucherAmount } =
    params as {
      sessionId?: string;
      lesson?: string;
      voucherOptionId?: string;
      voucherAmount?: string;
    };

  if (sessionId) {
    const session = await prisma.courseSession.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });

    if (!session) notFound();

    return (
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-16">
        <BookingPageHeader title={session.course?.title || "Kurs"} />
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-[var(--color-forest)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1.5">
            {formatDate(session.date)} · {session.startTime}-{session.endTime}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1.5">
            {session.location}
          </span>
        </div>
        <BookingForm
          type="COURSE"
          session={{
            id: session.id,
            date: session.date.toISOString().split("T")[0],
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.location,
            priceCHF: session.priceCHF,
            availableSpots: session.availableSpots,
            course: session.course
              ? { title: session.course.title }
              : { title: "Kurs" },
          }}
        />
      </div>
    );
  }

  if (lesson) {
    const lessonType = lesson.toUpperCase() === "PRIVATE" ? "PRIVATE" : "TASTER";
    const offering = await prisma.lessonOffering.findUnique({
      where: { type: lessonType },
    });
    if (!offering) notFound();

    return (
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-16">
        <BookingPageHeader
          title={offering.title}
          description={offering.description}
        />
        <BookingForm
          type={lessonType}
          lesson={{
            type: lessonType,
            title: offering.title,
            description: offering.description,
            priceCHF: offering.priceCHF,
            minHours: offering.minHours,
            additionalPersonCHF: offering.additionalPersonCHF,
          }}
        />
      </div>
    );
  }

  if (voucherOptionId) {
    const option = await prisma.voucherOption.findUnique({
      where: { id: voucherOptionId },
    });
    if (!option) notFound();
    const parsedAmount = Number(voucherAmount);
    const initialVoucherAmount = Number.isFinite(parsedAmount)
      ? parsedAmount
      : undefined;

    return (
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-20 pt-16">
        <BookingPageHeader title={option.title} />
        <BookingForm
          type="VOUCHER"
          initialVoucherAmount={initialVoucherAmount}
          voucherOption={{
            id: option.id,
            title: option.title,
            description: option.description,
            kind: option.kind,
            values: option.values,
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-16">
      <p className="text-sm text-[var(--color-muted)]">
        Bitte wähle einen Kurs, eine Schnupperstunde oder einen Gutschein.
      </p>
    </div>
  );
}
