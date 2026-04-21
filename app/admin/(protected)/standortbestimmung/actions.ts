"use server";

import type { ContactRequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const validStatuses: ContactRequestStatus[] = ["OPEN", "DONE", "ARCHIVED"];

export async function updateCastingAssessmentStatus(
  id: string,
  status: ContactRequestStatus
) {
  const admin = await getAdminFromSession();
  if (!admin) return { ok: false };
  if (!id || !validStatuses.includes(status)) return { ok: false };

  await prisma.castingAssessmentSubmission.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/standortbestimmung");
  return { ok: true };
}

export async function updateCastingAssessmentNotes(id: string, adminNotes: string) {
  const admin = await getAdminFromSession();
  if (!admin) return { ok: false };
  if (!id) return { ok: false };

  await prisma.castingAssessmentSubmission.update({
    where: { id },
    data: { adminNotes: adminNotes.trim() || null },
  });
  revalidatePath("/admin/standortbestimmung");
  return { ok: true };
}
