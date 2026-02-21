"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderNavProps {
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

export default function HeaderNav({ isLoggedIn, userName, imageUrl }: HeaderNavProps) {
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
        <div className="flex items-center justify-end gap-3 py-2">
          {isLoggedIn ? (
            <>
              {/* 프로필 사진 + 닉네임 */}
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
