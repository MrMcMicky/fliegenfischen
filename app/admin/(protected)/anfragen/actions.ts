"use server";

import { revalidatePath } from "next/cache";
import { ContactRequestStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function updateContactStatus(
  id: string,
  status: ContactRequestStatus
) {
  if (!id) return { ok: false };
  await prisma.contactRequest.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/anfragen");
  return { ok: true };
}

export async function deleteContactRequest(id: string) {
  if (!id) return { ok: false };
  await prisma.contactRequest.delete({
    where: { id },
  });
  revalidatePath("/admin/anfragen");
  return { ok: true };
}
