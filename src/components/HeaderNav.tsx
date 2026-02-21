"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderNavProps {
  isLoggedIn: boolean;
  userName?: string;
}

const NAV_LINKS = [
  { label: "링크모음", href: "/links" },
  { label: "보증업체", href: "/guarantee" },
  { label: "사기꾼조회", href: "/scammer" },
  { label: "커뮤니티", href: "/community" },
  { label: "공지사항", href: "/notice" },
];

export default function HeaderNav({ isLoggedIn, userName }: HeaderNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="hidden sm:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">

        {/* 1열: 네비게이션 묶음 */}
        <div className="flex items-center justify-center">
          {NAV_LINKS.map(({ label, href }) => {
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

        {/* 2열: 인증 묶음 */}
        <div className="flex items-center justify-end gap-5 py-2">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-primary font-medium">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="rounded border border-primary bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-80 transition-opacity cursor-pointer"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded border border-primary bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="rounded border border-primary bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
              >
                회원가입
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
