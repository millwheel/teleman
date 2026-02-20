"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Send } from "lucide-react";
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
    <header className="w-full border-b border-gray-200 bg-white">
      {/* 상단 레이어: 로고 + 고객센터 버튼 */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* 로고 */}
        <Link href="/links" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]">
            <Send className="h-6 w-6 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
              텔레맨
            </span>
            <span className="text-xs text-gray-500 leading-tight">
              텔레그램 홍보방&nbsp;안전거래
            </span>
          </div>
        </Link>

        {/* 고객센터 버튼 */}
        <a
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-white hover:bg-[var(--primary-light)] transition-colors"
        >
          <Send className="h-4 w-4" strokeWidth={1.5} />
          <div className="flex flex-col leading-tight text-right">
            <span className="text-sm font-bold">텔레맨 고객센터</span>
            <span className="text-xs opacity-90">텔레그램 메신저 바로가기</span>
          </div>
        </a>
      </div>

      {/* 하단 레이어: 내비게이션 메뉴 */}
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          {/* 주요 메뉴 */}
          <nav className="flex items-center">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-5 py-3 text-sm font-semibold transition-colors hover:text-[var(--active)]",
                    isActive
                      ? "text-[var(--active)] border-b-2 border-[var(--active)]"
                      : "text-gray-700"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* 인증 버튼 */}
          <div className="flex items-center gap-2 py-2">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-600 font-medium px-2">
                  {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "rounded border px-3 py-1.5 text-sm font-medium transition-colors",
                    pathname === "/login"
                      ? "border-[var(--active)] text-[var(--active)]"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "rounded border px-3 py-1.5 text-sm font-medium transition-colors",
                    pathname === "/register"
                      ? "border-[var(--active)] bg-[var(--active)] text-white"
                      : "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]"
                  )}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
