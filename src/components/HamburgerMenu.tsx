"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HamburgerMenuProps {
  isLoggedIn: boolean;
  userName?: string;
  imageUrl: string | null;
}

const NAV_LINKS = [
  { label: "링크모음", href: "/links" },
  { label: "보증업체", href: "/guarantee" },
  { label: "사기꾼조회", href: "/scammer" },
  { label: "커뮤니티", href: "/community" },
  { label: "공지사항", href: "/notice" },
];

export default function HamburgerMenu({ isLoggedIn, userName, imageUrl }: HamburgerMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <>
      {/* 햄버거 버튼 — 모바일만 표시 */}
      <button
        className="sm:hidden flex flex-col justify-center gap-1.5 p-2 cursor-pointer"
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

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 border-t border-secondary bg-white z-50">
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
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
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
                    onClick={() => { setMenuOpen(false); void handleLogout(); }}
                    className="rounded border border-primary bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded border border-primary bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded border border-primary bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
