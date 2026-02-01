import { redirect } from "next/navigation";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { getAdminFromSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromSession();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[var(--color-stone)]">
      <AdminNavigation
        adminName={admin.name}
        isSuperAdmin={admin.role === "SUPER_ADMIN"}
      />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
