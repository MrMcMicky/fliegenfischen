import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";
import { ReportEditor } from "@/components/admin/ReportEditor";

export const dynamic = "force-dynamic";

export default async function AdminReportEditPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  if (!id) {
    redirect("/admin/berichte");
  }
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) {
    redirect("/admin/berichte");
  }

  async function updateReport(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const year = String(formData.get("year") || "").trim();
    const summary = String(formData.get("summary") || "").trim();
    const coverImage = String(formData.get("coverImage") || "").trim();
    const body = String(formData.get("body") || "").trim();
    const highlights = parseLines(String(formData.get("highlights") || ""));

    await prisma.report.update({
      where: { id },
      data: {
        title,
        slug,
        location,
        year,
        summary,
        coverImage: coverImage || null,
        body,
        highlights,
      },
    });

    redirect("/admin/berichte");
  }

  async function deleteReport() {
    "use server";
    await prisma.report.delete({ where: { id } });
    redirect("/admin/berichte");
  }

  return (
    <ReportEditor
      action={updateReport}
      deleteAction={deleteReport}
      initial={{
        title: report.title,
        slug: report.slug,
        location: report.location,
        year: report.year,
        summary: report.summary,
        coverImage: report.coverImage,
        body: report.body,
        highlights: report.highlights,
      }}
      submitLabel="Speichern"
    />
  );
}
