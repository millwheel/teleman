"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "관리자 관리", href: "/admin/managers" },
  { label: "회원 관리", href: "/admin/users" },
  { label: "링크모음 관리", href: "/admin/link" },
  { label: "보증업체 관리", href: "/admin/guarantee" },
  { label: "광고배너 관리", href: "/admin/ad" },
  { label: "사기꾼 관리", href: "/admin/scammer" },
];

interface Props {
  userName?: string;
  imageUrl: string | null;
}

export default function AdminHeaderNav({ userName, imageUrl }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="hidden sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
        <div className="flex items-center">
          {ADMIN_NAV.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "md:px-5 px-3 py-3 text-base font-semibold transition-colors hover:text-active",
                  isActive
                    ? "text-active border-b-2 border-active"
                    : "text-primary"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 py-2">
          <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="프로필 사진"
                width={32}
                height={32}
                className="rounded-full object-cover w-8 h-8"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </span>
            )}
            <span className="text-sm text-primary font-medium">{userName}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="rounded border border-primary bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
