"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Image
            src="/images/logo.png"
            alt="텔레맨 로고"
            width={48}
            height={48}
            className="rounded-lg"
            priority
          />
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tight text-primary">
              텔레맨
            </span>
            <span className="text-xs text-primary leading-tight">
              텔레그램 홍보방&nbsp;안전거래
            </span>
          </div>
        </Link>

        {/* 고객센터 버튼 — 데스크탑만 표시 */}
        <a
          href="https://t.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
        >
          <Image
            src="/images/contact.jpg"
            alt="텔레맨 고객센터 텔레그램 메신저 바로가기"
            width={300}
            height={75}
            className="h-14 w-auto"
            priority
          />
        </a>

        {/* 햄버거 버튼 — 모바일만 표시 */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-2 cursor-pointer"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="메뉴 열기"
        >
          <span
            className={cn(
              "block h-0.5 w-6 bg-primary transition-transform duration-200",
              menuOpen && "translate-y-2 rotate-45"
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-6 bg-primary transition-opacity duration-200",
              menuOpen && "opacity-0"
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-6 bg-primary transition-transform duration-200",
              menuOpen && "-translate-y-2 -rotate-45"
            )}
          />
        </button>
      </div>

      {/* 하단 레이어: 내비게이션 메뉴 — 데스크탑 */}
      <div className="hidden md:block border-t border-secondary">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-5 py-3 text-base font-semibold transition-colors hover:text-active",
                  isActive
                    ? "text-active border-b-2 border-active"
                    : "text-primary"
                )}
              >
                {label}
              </Link>
            );
          })}

          {/* 인증 버튼 */}
          <div className="ml-8 flex items-center gap-3 py-2">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-primary font-medium">
                  {userName}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:opacity-70 transition-opacity cursor-pointer"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "rounded border px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80",
                    pathname === "/login"
                      ? "border-active bg-active text-white"
                      : "border-primary bg-primary text-white"
                  )}
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "rounded border px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80",
                    pathname === "/register"
                      ? "border-active bg-active text-white"
                      : "border-primary bg-primary text-white"
                  )}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-secondary bg-white">
          <nav className="flex flex-col">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-6 py-3 text-base font-semibold border-b border-gray-100 transition-colors",
                    isActive ? "text-active bg-active/5" : "text-primary hover:bg-gray-50"
                  )}
                >
                  {label}
                </Link>
              );
            })}

            {/* 고객센터 */}
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex justify-center border-b border-gray-100 px-6 py-4 hover:opacity-90 transition-opacity"
            >
              <Image
                src="/images/contact.jpg"
                alt="텔레맨 고객센터 텔레그램 메신저 바로가기"
                width={300}
                height={75}
                className="h-14 w-auto rounded-lg"
              />
            </a>

            {/* 인증 버튼 */}
            <div className="flex items-center gap-3 px-6 py-4">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-primary font-medium">{userName}</span>
                  <button
                    onClick={() => { setMenuOpen(false); void handleLogout(); }}
                    className="rounded border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "rounded border px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80",
                      pathname === "/login"
                        ? "border-active bg-active text-white"
                        : "border-primary bg-primary text-white"
                    )}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "rounded border px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80",
                      pathname === "/register"
                        ? "border-active bg-active text-white"
                        : "border-primary bg-primary text-white"
                    )}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
