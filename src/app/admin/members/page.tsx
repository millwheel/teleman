import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminManager from "@/components/admin/AdminManager";

export default async function AdminsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  return <AdminManager currentUserId={session.userId} />;
}
