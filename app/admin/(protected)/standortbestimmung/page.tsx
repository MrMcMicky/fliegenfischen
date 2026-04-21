import { prisma } from "@/lib/db";
import CastingAssessmentTable from "./CastingAssessmentTable";

export const dynamic = "force-dynamic";

export default async function AdminCastingAssessmentPage() {
  const submissions = await prisma.castingAssessmentSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = submissions.map((submission) => ({
    id: submission.id,
    createdAt: submission.createdAt.toISOString(),
    name: submission.name,
    email: submission.email,
    phone: submission.phone,
    score: submission.score,
    levelKey: submission.levelKey,
    levelTitle: submission.levelTitle,
    recommendation: submission.recommendation,
    goal: submission.goal,
    answers: submission.answers,
    status: submission.status,
    adminNotes: submission.adminNotes,
  }));

  return <CastingAssessmentTable rows={rows} />;
}
