import { notFound } from "next/navigation";

import { BookingForm } from "@/components/BookingForm";
import { SectionHeader } from "@/components/SectionHeader";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Buchung",
  description: "Kurs oder Gutschein buchen.",
};

export const dynamic = "force-dynamic";

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
        <SectionHeader
          eyebrow="Buchung"
          title={session.course?.title || "Kurs"}
          description=""
        />
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
        <SectionHeader
          eyebrow="Buchung"
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
        <SectionHeader
          eyebrow="Buchung"
          title={option.title}
          description={option.description}
        />
        <BookingForm
          type="VOUCHER"
          initialVoucherAmount={initialVoucherAmount}
          voucherOption={{
            id: option.id,
            title: option.title,
            description: option.description,
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
