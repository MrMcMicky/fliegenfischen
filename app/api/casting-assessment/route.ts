import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { evaluateCastingAssessment } from "@/lib/casting-assessment";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        phone?: string;
        company?: string;
        answerOptionIds?: Record<string, string>;
      }
    | null;

  if (!payload) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  if (payload.company?.trim()) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const phone = String(payload.phone || "").trim();

  if (!name || !email || !payload.answerOptionIds) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  let result: ReturnType<typeof evaluateCastingAssessment>;
  try {
    result = evaluateCastingAssessment(payload.answerOptionIds);
  } catch {
    return NextResponse.json({ error: "incomplete_answers" }, { status: 400 });
  }

  const goalAnswer = result.answers.find((answer) => answer.questionId === "goal");

  await prisma.castingAssessmentSubmission.create({
    data: {
      name,
      email,
      phone: phone || null,
      score: result.score,
      levelKey: result.level.key,
      levelTitle: result.level.title,
      recommendation: result.level.recommendation,
      goal: goalAnswer?.answer || null,
      answers: result.answers as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    ok: true,
    score: result.score,
    level: result.level,
  });
}
