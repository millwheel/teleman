import { headers } from "next/headers";
import Image from "next/image";

type BannerType = "long" | "short";

interface CommonBanner {
  id: number;
  name: string;
  link: string;
  type: BannerType;
  public_url: string;
}

interface Category {
  id: number;
  name: string;
  sort_order: number;
}

interface TextBanner {
  id: number;
  name: string;
  link: string;
  category_id: number;
  sort_order: number;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function LinksPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/banners/links`);
  const { longBanners, shortBanners, categories, textBanners }: {
    longBanners: CommonBanner[];
    shortBanners: CommonBanner[];
    categories: Category[];
    textBanners: TextBanner[];
  } = await res.json();

  const displayBanners = shuffle([...longBanners, ...shortBanners]);

  const bannersByCategory = textBanners.reduce<Record<number, TextBanner[]>>((acc, banner) => {
    if (!acc[banner.category_id]) acc[banner.category_id] = [];
    acc[banner.category_id].push(banner);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4">

      {/* 광고 배너 - 긴(col-span-2) + 짧은(col-span-1) 혼합 4열 그리드 */}
      {displayBanners.length > 0 && (
        <section className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {displayBanners.map((banner) => (
              <a
                key={`${banner.type}-${banner.id}`}
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative block overflow-hidden w-full ${banner.type === "long" ? "col-span-2" : "col-span-1"}`}
                style={{ height: "104px" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.public_url}
                  alt={banner.name}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 텍스트 배너 카테고리 4열 그리드 */}
      <section className="pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((category) => {
            const banners = (bannersByCategory[category.id] ?? []).slice(0, 10);
            return (
              <div
                key={category.id}
                className="overflow-hidden rounded-lg border border-secondary"
              >
                <div className="bg-primary px-2 py-2 text-center text-sm font-bold text-white">
                  {category.name}
                </div>
                <div className="bg-primary/90 divide-y divide-white/10">
                  {Array.from({ length: 10 }, (_, i) => {
                    const banner = banners[i];
                    return banner ? (
                      <a
                        key={banner.id}
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-2 py-1.5 text-center 로text-sm text-white hover:bg-white/10 transition-colors"
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
