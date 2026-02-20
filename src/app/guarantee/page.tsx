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

export default async function GuaranteePage() {
  const { data: allBanners } = await supabase
    .from("image_banner")
    .select("*");

  const banners = shuffle(allBanners ?? []);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4">
      {/* 이미지 배너 4열 그리드 */}
      <section className="py-4">
        {banners.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {banners.map((banner) => (
              <a
                key={banner.id}
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden border border-secondary bg-primary"
                style={{ aspectRatio: "1 / 1" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPublicImageUrl(banner.image_url)}
                  alt={banner.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                {/* hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </a>
            ))}
          </div>
        ) : (
          /* 데이터 없을 때 placeholder 그리드 */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center bg-primary text-white text-sm font-medium"
                style={{ aspectRatio: "1 / 1" }}
              >
                [ 배너 ]
              </div>
            ))}
          </div>
        )}
      </section>
      </div>

      {/* 하단 Static 프로모 배너 (full-width) */}
      <BottomGuaranteeBanner />
    </div>
  );
}

function BottomGuaranteeBanner() {
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
            <span className="text-secondary">텔레맨</span>{" "}
            <span className="text-white">보증업체 리스트</span>
          </p>
          <p className="text-yellow-400 font-semibold text-sm mb-4">
            검증은 기본 · 보상은 확실 · 믿고 배팅하라
          </p>
          <ul className="space-y-1.5 text-white/80 text-sm">
            <li>1. 운영자 신원·운영 정식·출금 안정성 직접 확인</li>
            <li>2. 출금 시간·인증 절차·회원 후기 신뢰도 검증</li>
            <li>3. 최대 1억원 실제 보증금 예치 및 즉시 보상</li>
            <li>4. 24시간 365일 고객센터 즉시 문제 해결 지원</li>
          </ul>
        </div>
        <div className="hidden md:flex h-24 w-24 items-center justify-center rounded-full bg-primary/30 border-2 border-secondary/40 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12">
            <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
