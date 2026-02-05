import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getAdminFromSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getAdminFromSession();
  if (!admin || admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  async function createUser(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const roleValue = String(formData.get("role") || "ADMIN");
    const role = roleValue === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
    const password = String(formData.get("password") || "").trim();

    if (!name || !email || !password) return;

    await prisma.adminUser.create({
      data: {
        name,
        email,
        role,
        passwordHash: await hashPassword(password),
        isActive: true,
      },
    });
  }

  async function toggleUser(formData: FormData) {
    "use server";

    const id = String(formData.get("id") || "");
    if (!id) return;

    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) return;

    await prisma.adminUser.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold">Benutzer</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Admin-Accounts verwalten.
        </p>
      </div>

      <form action={createUser} className="grid gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 md:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="user-name" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Name
          </label>
          <input id="user-name" name="name" placeholder="z. B. Urs Müller" className="form-input px-3 py-2" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="user-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            E‑Mail (Login)
          </label>
          <input id="user-email" name="email" placeholder="name@domain.ch" className="form-input px-3 py-2" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="user-password" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Passwort (Initial)
          </label>
          <input id="user-password" name="password" placeholder="mind. 8 Zeichen" className="form-input px-3 py-2" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="user-role" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Rolle
          </label>
          <select id="user-role" name="role" className="form-input px-3 py-2">
            <option value="ADMIN">Admin (Standard)</option>
            <option value="SUPER_ADMIN">Super Admin (alle Rechte)</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-full bg-[var(--color-ember)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow md:col-span-4"
        >
          Benutzer anlegen
        </button>
      </form>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-white p-4 text-sm">
            <div>
              <p className="font-semibold text-[var(--color-text)]">{user.name}</p>
              <p className="text-[var(--color-muted)]">{user.email} · {user.role}</p>
            </div>
            <form action={toggleUser}>
              <input type="hidden" name="id" value={user.id} />
              <button className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]">
                {user.isActive ? "Deaktivieren" : "Aktivieren"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
