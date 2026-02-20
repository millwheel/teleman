import Image from "next/image";
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
      <div className="mx-auto max-w-7xl px-4">
      {/* 상단 Static 이미지 */}
        <div className="w-full pt-4">
            <Image
                src="/images/link-page-top.jpg"
                alt="텔레맨 링크모음"
                width={1920}
                height={400}
                className="w-full h-auto"
                priority
            />
        </div>

      {/* 공통 배너 2×2 */}
      <section className="py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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
                  className="flex items-center justify-center bg-primary text-white text-sm font-medium"
                  style={{ aspectRatio: "3 / 1" }}
                >
                  [ 배너 ]
                </div>
              )
          )}
        </div>
      </section>

      {/* 텍스트 배너 카테고리 4열 그리드 */}
      <section className="pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(categories ?? []).map((category) => {
            const banners = (bannersByCategory[category.id] ?? []).slice(0, 10);
            return (
              <div
                key={category.id}
                className="overflow-hidden rounded-lg border border-secondary"
              >
                {/* 카테고리 헤더 */}
                <div className="bg-primary px-2 py-2 text-center text-xs font-bold text-white">
                  {category.name}
                </div>
                {/* 배너 목록: 항상 10행 표시 */}
                <div className="bg-primary/90 divide-y divide-white/10">
                  {Array.from({ length: 10 }, (_, i) => {
                    const banner = banners[i];
                    return banner ? (
                      <a
                        key={banner.id}
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-2 py-1.5 text-center text-xs text-white hover:bg-white/10 transition-colors"
                      >
                        [ {banner.name} ]
                      </a>
                    ) : (
                      <div
                        key={`empty-${i}`}
                        className="px-2 py-1.5 text-center text-xs text-white/25"
                      >
                        [ 빈 칸 ]
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

        <div className="w-full mt-4 pb-4">
            <Image
                src="/images/link-page-bottom.jpg"
                alt="텔레맨 링크모음 - 복잡한 검색은 끝, 안전한 접속만 남다"
                width={1920}
                height={500}
                className="w-full h-auto"
            />
        </div>
      </div>
    </div>
  );
}
