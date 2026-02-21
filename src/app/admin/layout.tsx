import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

const ADMIN_NAV = [
  { label: "관리자 관리", href: "/admin/members" },
  { label: "링크모음 관리", href: "/admin/text-banner" },
  { label: "보증업체 관리", href: "/admin/image-banner" },
  { label: "광고배너 관리", href: "/admin/common-banner" },
];

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
      {/* 관리자 서브 네비게이션 */}
      <div className="bg-primary text-white text-sm">
        <div className="flex items-center justify-center gap-1 h-10 px-4">
          {ADMIN_NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </div>
  );
}
