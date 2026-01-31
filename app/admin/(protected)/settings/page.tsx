import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

const stringify = (value: unknown) => JSON.stringify(value, null, 2);

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

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
        <h2 className="font-display text-2xl font-semibold">Einstellungen</h2>
        <p className="text-sm text-[var(--color-muted)]">
          JSON-Inhalte für Navigation und Inhalte.
        </p>
      </div>
      <form action={updateSettings} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <input name="name" defaultValue={settings.name} placeholder="Name" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="tagline" defaultValue={settings.tagline} placeholder="Tagline" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
          <input name="location" defaultValue={settings.location} placeholder="Location" className="rounded-lg border border-[var(--color-border)] px-3 py-2" />
        </div>

        <textarea name="contact" defaultValue={stringify(settings.contact)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="navLinks" defaultValue={stringify(settings.navLinks)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="footerLinks" defaultValue={stringify(settings.footerLinks)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="categorySummaries" defaultValue={stringify(settings.categorySummaries)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="homeHero" defaultValue={stringify(settings.homeHero)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="aboutSection" defaultValue={stringify(settings.aboutSection)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="aboutPage" defaultValue={stringify(settings.aboutPage)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="homeSections" defaultValue={stringify(settings.homeSections)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="uspItems" defaultValue={stringify(settings.uspItems)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="faqs" defaultValue={stringify(settings.faqs)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="testimonials" defaultValue={stringify(settings.testimonials)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="testimonialSection" defaultValue={stringify(settings.testimonialSection)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />
        <textarea name="coursePathSteps" defaultValue={stringify(settings.coursePathSteps)} rows={6} className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 font-mono text-xs" />

        <button
          type="submit"
          className="rounded-full bg-[var(--color-forest)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
