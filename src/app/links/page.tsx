import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function LinksPage() {
  const [
    { data: allCommonBanners },
    { data: categories },
    { data: allTextBanners },
  ] = await Promise.all([
    supabase.from("common_banner").select("*"),
    supabase.from("text_banner_categories").select("*").order("sort_order"),
    supabase.from("text_banners").select("*").order("sort_order"),
  ]);

  const commonBanners = shuffle(allCommonBanners ?? []).slice(0, 4);

  type TextBanner = NonNullable<typeof allTextBanners>[number];
  const bannersByCategory = (allTextBanners ?? []).reduce<
    Record<number, TextBanner[]>
  >((acc, banner) => {
    if (!acc[banner.category_id]) acc[banner.category_id] = [];
    acc[banner.category_id].push(banner);
    return acc;
  }, {});

  return (
    <div className="bg-white">
      {/* 상단 Static 이미지 */}
      <TopHeroBanner />

      {/* 공통 배너 2×2 */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="grid grid-cols-2 gap-1">
          {Array.from({ length: 4 }, (_, i) => commonBanners[i] ?? null).map(
            (banner, i) =>
              banner ? (
                <a
                  key={banner.id}
                  href={banner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block overflow-hidden"
                  style={{ aspectRatio: "3 / 1" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPublicImageUrl(banner.image_url)}
                    alt={banner.name}
                    className="h-full w-full object-cover"
                  />
                </a>
              ) : (
                <div
                  key={i}
                  className="flex items-center justify-center bg-[var(--secondary)] text-white text-sm font-medium"
                  style={{ aspectRatio: "3 / 1" }}
                >
                  [ 배너 ]
                </div>
              )
          )}
        </div>
      </section>

      {/* 텍스트 배너 카테고리 4열 그리드 */}
      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {(categories ?? []).map((category) => {
            const banners = (bannersByCategory[category.id] ?? []).slice(0, 10);
            return (
              <div
                key={category.id}
                className="overflow-hidden border border-[var(--secondary)]"
              >
                {/* 카테고리 헤더 */}
                <div className="bg-[var(--secondary)] px-2 py-2 text-center text-xs font-bold text-white">
                  {category.name}
                </div>
                {/* 배너 목록 */}
                <div className="bg-[var(--secondary)]/90 divide-y divide-white/10">
                  {banners.length > 0 ? (
                    banners.map((banner) => (
                      <a
                        key={banner.id}
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-2 py-1.5 text-center text-xs text-white hover:bg-white/10 transition-colors"
                      >
                        [ {banner.name} ]
                      </a>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-center text-xs text-white/40">
                      등록된 링크 없음
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 하단 Static 프로모 배너 */}
      <BottomLinksBanner />
    </div>
  );
}

function TopHeroBanner() {
  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
        minHeight: "200px",
      }}
    >
      {/* 배경 장식 원 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { top: "10%", left: "5%", size: 60, opacity: 0.08 },
          { top: "60%", left: "15%", size: 40, opacity: 0.06 },
          { top: "20%", right: "10%", size: 80, opacity: 0.07 },
          { top: "70%", right: "20%", size: 50, opacity: 0.05 },
          { top: "40%", left: "45%", size: 100, opacity: 0.04 },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white"
            style={{
              top: c.top,
              left: (c as { left?: string }).left,
              right: (c as { right?: string }).right,
              width: c.size,
              height: c.size,
              opacity: c.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--primary)]">
              <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">텔레맨</h1>
              <p className="text-sm text-blue-300">텔레그램 홍보방 안전거래</p>
            </div>
          </div>
          <p className="text-white/70 text-sm mt-2">
            국내 최대 텔레그램 링크 모음 서비스
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2 text-right">
          <span className="text-yellow-400 font-bold text-lg">365일 실시간 업데이트</span>
          <span className="text-white/60 text-sm">검증된 링크만 엄선하여 제공합니다</span>
        </div>
      </div>
    </div>
  );
}

function BottomLinksBanner() {
  return (
    <div
      className="w-full mt-4"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0f172a 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 flex items-center justify-between gap-8">
        <div className="flex-1">
          <p className="text-2xl font-extrabold mb-1">
            <span className="text-[var(--primary-light)]">텔레맨</span>{" "}
            <span className="text-white">링크모음</span>
          </p>
          <p className="text-yellow-400 font-semibold text-sm mb-4">
            복잡한 검색은 끝, 안전한 접속만 남다.
          </p>
          <ul className="space-y-1.5 text-white/80 text-sm">
            <li>1. 정확 365일 실시간 업데이트</li>
            <li>2. 검증 100% 공식 인증 링크모음</li>
            <li>3. 책임 보증금 기반 안전 보장</li>
            <li>4. 소통 24시간 연중무휴 고객지원</li>
          </ul>
        </div>
        <div className="hidden md:flex h-24 w-24 items-center justify-center rounded-full bg-[var(--primary)]/30 border-2 border-[var(--primary-light)]/40 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
