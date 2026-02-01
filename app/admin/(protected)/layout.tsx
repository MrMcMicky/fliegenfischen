import { redirect } from "next/navigation";

import { getAdminFromSession } from "@/lib/auth";
import AdminNav from "./AdminNav";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromSession();
  if (!admin) {
    redirect("/admin/login");
  }

  const navGroups = [
    {
      label: "Dashboard",
      items: [{ href: "/admin", label: "Dashboard" }],
    },
    {
      label: "Kurse",
      items: [
        { href: "/admin/kurse", label: "Kurs-Typen" },
        { href: "/admin/termine", label: "Termine" },
        { href: "/admin/angebote", label: "Angebote" },
        { href: "/admin/buchungen", label: "Buchungen" },
        { href: "/admin/zahlungen", label: "Zahlungen" },
      ],
    },
    {
      label: "Anfragen",
      items: [{ href: "/admin/anfragen", label: "Anfragen" }],
    },
    {
      label: "Gutscheine",
      items: [{ href: "/admin/gutscheine", label: "Gutscheine" }],
    },
    {
      label: "Inhalte",
      items: [
        { href: "/admin/inhalte/texte", label: "Texte Frontpage" },
        { href: "/admin/berichte", label: "Berichte" },
      ],
    },
  ];

  if (admin.role === "SUPER_ADMIN") {
    navGroups.push({
      label: "Einstellungen",
      items: [{ href: "/admin/settings", label: "Einstellungen" }],
    });
    navGroups.push({
      label: "Benutzer",
      items: [{ href: "/admin/users", label: "Benutzer" }],
    });
  }

  return (
    <div className="min-h-screen bg-[var(--color-stone)]">
      <header className="bg-[var(--color-forest)] px-6 py-6 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Admin
              </p>
              <h1 className="font-display text-2xl font-semibold">
                Fliegenfischerschule
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/70">
              <span>{admin.name}</span>
              <LogoutButton />
            </div>
          </div>
          <AdminNav groups={navGroups} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
