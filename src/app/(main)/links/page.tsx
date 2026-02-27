import { headers } from "next/headers";
import Image from "next/image";
import type { CommonBanner, LinkCategory, LinkItem } from "@/data/type";
import { shuffle } from "@/util/shuffle";
import Link from "next/link";
import AdBannerGrid from "@/components/AdBannerGrid";

export default async function LinksPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/banners/links`);
  const { longBanners = [], shortBanners = [], categories = [], textBanners = [] }: {
    longBanners: CommonBanner[];
    shortBanners: CommonBanner[];
    categories: LinkCategory[];
    textBanners: LinkItem[];
  } = await res.json();

  const displayBanners = shuffle([...longBanners, ...shortBanners]);

  const bannersByCategory = textBanners.reduce<Record<number, LinkItem[]>>((acc, banner) => {
    if (!acc[banner.category_id]) acc[banner.category_id] = [];
    acc[banner.category_id].push(banner);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4">

      <AdBannerGrid banners={displayBanners} />

      {/* 텍스트 배너 카테고리 4열 그리드 */}
      <section className="pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((category) => {
            const banners = (bannersByCategory[category.sort_order + 1] ?? []).slice(0, 10);
            return (
              <div
                key={category.code}
                className="overflow-hidden rounded-lg border border-secondary"
              >
                <Link
                  href={`/links/${category.code}`}
                  className="block bg-primary px-2 py-2 text-center text-sm font-bold text-white hover:opacity-80 transition-opacity"
                >
                  {category.name} TOP 10
                </Link>
                <div className="bg-primary/90 divide-y divide-white/10">
                  {Array.from({ length: 10 }, (_, i) => {
                    const banner = banners[i];
                    return banner ? (
                      <a
                        key={banner.id}
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-2 py-1.5 text-center text-sm text-white hover:bg-white/10 transition-colors"
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

      {/* Static 이미지 */}
      <section className="w-full pt-4">
        <Image
            src="/images/link-banner.jpg"
            alt="텔레맨 링크모음 배너"
            width={1920}
            height={400}
            className="w-full h-auto"
            priority
        />
      </section>

    </div>
  );
}
