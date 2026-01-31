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

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/kurse", label: "Kurse" },
    { href: "/admin/termine", label: "Termine" },
    { href: "/admin/angebote", label: "Angebote" },
    { href: "/admin/gutscheine", label: "Gutscheine" },
    { href: "/admin/berichte", label: "Berichte" },
    { href: "/admin/anfragen", label: "Anfragen" },
    { href: "/admin/buchungen", label: "Buchungen" },
    { href: "/admin/zahlungen", label: "Zahlungen" },
    { href: "/admin/settings", label: "Einstellungen" },
  ];

  if (admin.role === "SUPER_ADMIN") {
    navItems.push({ href: "/admin/users", label: "Benutzer" });
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
          <AdminNav items={navItems} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
