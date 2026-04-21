CREATE TABLE "CastingAssessmentSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "score" INTEGER NOT NULL,
    "levelKey" TEXT NOT NULL,
    "levelTitle" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "goal" TEXT,
    "answers" JSONB NOT NULL,
    "status" "ContactRequestStatus" NOT NULL DEFAULT 'OPEN',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CastingAssessmentSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CastingAssessmentSubmission_createdAt_idx" ON "CastingAssessmentSubmission"("createdAt");
CREATE INDEX "CastingAssessmentSubmission_status_idx" ON "CastingAssessmentSubmission"("status");
