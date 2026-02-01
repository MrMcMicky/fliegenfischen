import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseLines } from "@/lib/admin-utils";
import { ReportEditor } from "@/components/admin/ReportEditor";

export const dynamic = "force-dynamic";

export default function AdminReportNewPage() {
  async function createReport(formData: FormData) {
    "use server";

    const title = String(formData.get("title") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const location = String(formData.get("location") || "").trim();
    const year = String(formData.get("year") || "").trim();
    const summary = String(formData.get("summary") || "").trim();
    const coverImage = String(formData.get("coverImage") || "").trim();
    const body = String(formData.get("body") || "").trim();
    const highlights = parseLines(String(formData.get("highlights") || ""));

    await prisma.report.create({
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

  return (
    <ReportEditor
      action={createReport}
      initial={{
        title: "",
        slug: "",
        location: "",
        year: "",
        summary: "",
        coverImage: "",
        body: "",
        highlights: [],
      }}
      submitLabel="Anlegen"
    />
  );
}
