import { prisma } from "@/lib/db";
import ContactRequestsTable from "./ContactRequestsTable";

export const dynamic = "force-dynamic";

export default async function AdminAnfragenPage() {
  const requests = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  const rows = requests.map((request) => ({
    id: request.id,
    createdAt: request.createdAt.toISOString(),
    name: request.name,
    email: request.email,
    phone: request.phone,
    subject: request.subject,
    message: request.message,
    status: request.status,
  }));

  return <ContactRequestsTable rows={rows} />;
}
