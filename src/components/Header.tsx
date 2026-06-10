import { getSession } from "@/lib/auth";
import Image from "next/image";
import HeaderNav from "./HeaderNav";
import HamburgerMenu from "./HamburgerMenu";
import LogoBrand from "./LogoBrand";

const STORAGE_BASE = `${process.env.SUPABASE_URL}/storage/v1/object/public/public-media`;

export default async function Header() {
  const session = await getSession();

  const imageUrl = session?.imagePath
    ? `${STORAGE_BASE}/${session.imagePath}`
    : null;

  return (
    <header className="relative w-full border-b border-gray-200 bg-white">
      {/* 상단 레이어: 로고 + 고객센터 버튼 */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* 로고 */}
        <LogoBrand />

        {/* 고객센터 버튼 — 데스크탑만 표시 */}
        <a
          href="https://t.me/azt1133"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:block overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
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

        {/* 햄버거 메뉴 — 모바일만 표시 */}
        <HamburgerMenu
          isLoggedIn={!!session}
          userName={session?.nickname}
          imageUrl={imageUrl}
        />
      </div>

      {/* 하단 레이어: 내비게이션 메뉴 — 데스크탑 */}
      <HeaderNav
        isLoggedIn={!!session}
        userName={session?.nickname}
        imageUrl={imageUrl}
      />
    </header>
  );
}
