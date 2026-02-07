import { redirect } from "next/navigation";
import type { BookingStatus } from "@prisma/client";

import AdminNavigation from "@/components/admin/AdminNavigation";
import { getAdminFromSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromSession();
  if (!admin) {
    redirect("/admin/login");
  }
  const openBookingStatuses: BookingStatus[] = [
    "PENDING",
    "PAYMENT_PENDING",
    "INVOICE_REQUESTED",
  ];
  const [openBookingCount, openContactCount] = await Promise.all([
    prisma.booking.count({
      where: { status: { in: openBookingStatuses } },
    }),
    prisma.contactRequest.count({ where: { status: "OPEN" } }),
  ]);

  return (
    <div className="min-h-screen bg-[var(--color-stone)]">
      <AdminNavigation
        adminName={admin.name}
        isSuperAdmin={admin.role === "SUPER_ADMIN"}
        badges={{
          "/admin/kurse": openBookingCount,
          "/admin/anfragen": openContactCount,
        }}
      >
        {children}
      </AdminNavigation>
    </div>
  );
}
