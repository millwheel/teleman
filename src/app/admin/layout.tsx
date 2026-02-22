import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/admin");
  if (session.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
