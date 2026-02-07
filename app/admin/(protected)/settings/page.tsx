import { readdir, stat } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/admin-utils";
import { getAdminFromSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const stringify = (value: unknown) => JSON.stringify(value, null, 2);

export default async function AdminSettingsPage() {
  const admin = await getAdminFromSession();
  if (!admin || admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const backupRoot = "/home/michael/backups/fliegenfischen";
  let backups: { name: string; size: number; updatedAt: Date }[] = [];

  try {
    const entries = await readdir(backupRoot, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const filePath = path.join(backupRoot, entry.name);
          const info = await stat(filePath);
          return { name: entry.name, size: info.size, updatedAt: info.mtime };
        })
    );
    backups = files.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  } catch {
    backups = [];
  }

  if (!settings) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm">
        Keine Settings gefunden. Bitte Seed ausführen.
      </div>
    );
  }

  async function updateSettings(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const tagline = String(formData.get("tagline") || "").trim();
    const location = String(formData.get("location") || "").trim();

    await prisma.siteSettings.update({
      where: { id: 1 },
      data: {
        name,
        tagline,
        location,
        contact: parseJson(formData.get("contact")?.toString()),
        navLinks: parseJson(formData.get("navLinks")?.toString()),
        footerLinks: parseJson(formData.get("footerLinks")?.toString()),
        categorySummaries: parseJson(formData.get("categorySummaries")?.toString()),
        homeHero: parseJson(formData.get("homeHero")?.toString()),
        aboutSection: parseJson(formData.get("aboutSection")?.toString()),
        aboutPage: parseJson(formData.get("aboutPage")?.toString()),
        homeSections: parseJson(formData.get("homeSections")?.toString()),
        uspItems: parseJson(formData.get("uspItems")?.toString()),
        faqs: parseJson(formData.get("faqs")?.toString()),
        testimonials: parseJson(formData.get("testimonials")?.toString()),
        testimonialSection: parseJson(formData.get("testimonialSection")?.toString()),
        coursePathSteps: parseJson(formData.get("coursePathSteps")?.toString()),
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">System & Backups</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Automatische Backups, Download sowie erweiterte System-Inhalte.
        </p>
      </div>
      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
            Automatische Backups
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Hier siehst du die vorhandenen Backups.
          </p>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {backups.length ? (
            backups.map((backup) => (
              <div
                key={backup.name}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-stone)] px-4 py-3"
              >
                <div>
                  <span className="font-semibold text-[var(--color-text)]">
                    {backup.name}
                  </span>
                  <div className="text-[var(--color-muted)]">
                    {(backup.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                    {backup.updatedAt.toLocaleString("de-CH")}
                  </div>
                </div>
                <a
                  href={`/api/admin/backups/${encodeURIComponent(backup.name)}`}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text)] transition hover:shadow"
                >
                  Download
                </a>
              </div>
            ))
          ) : (
            <p className="text-[var(--color-muted)]">
              Keine Backups gefunden.
            </p>
          )}
        </div>
      </section>
      <form action={updateSettings} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <input name="name" defaultValue={settings.name} placeholder="Name" className="form-input px-3 py-2" />
          <input name="tagline" defaultValue={settings.tagline} placeholder="Tagline" className="form-input px-3 py-2" />
          <input name="location" defaultValue={settings.location} placeholder="Location" className="form-input px-3 py-2" />
        </div>

        <textarea name="contact" defaultValue={stringify(settings.contact)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="navLinks" defaultValue={stringify(settings.navLinks)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="footerLinks" defaultValue={stringify(settings.footerLinks)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="categorySummaries" defaultValue={stringify(settings.categorySummaries)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="homeHero" defaultValue={stringify(settings.homeHero)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="aboutSection" defaultValue={stringify(settings.aboutSection)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="aboutPage" defaultValue={stringify(settings.aboutPage)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="homeSections" defaultValue={stringify(settings.homeSections)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="uspItems" defaultValue={stringify(settings.uspItems)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="faqs" defaultValue={stringify(settings.faqs)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="testimonials" defaultValue={stringify(settings.testimonials)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="testimonialSection" defaultValue={stringify(settings.testimonialSection)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />
        <textarea name="coursePathSteps" defaultValue={stringify(settings.coursePathSteps)} rows={6} className="w-full form-input px-3 py-2 font-mono text-xs" />

        <button
          type="submit"
          className="rounded-full bg-[var(--color-ember)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
