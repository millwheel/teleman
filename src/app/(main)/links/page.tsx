import { headers } from "next/headers";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { CommonBanner, LinkCategory, LinkItem } from "@/data/type";
import { shuffle } from "@/util/shuffle";
import Link from "next/link";
import AdBannerGrid from "@/components/AdBannerGrid";

const MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = [
  "text-blue-600",
  "text-cyan-500",
  "text-orange-500",
  "text-pink-500",
  "text-blue-600",
  "text-green-600",
  "text-orange-400",
  "text-pink-500",
  "text-blue-600",
  "text-pink-400",
];

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

      <section className="pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category) => {
            const items = (bannersByCategory[category.sort_order + 1] ?? []).slice(0, 10);
            return (
              <div key={category.code} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                <Link
                  href={`/links/${category.code}`}
                  className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {category.icon && <span className="text-xl shrink-0">{category.icon}</span>}
                  <span className="flex-1 text-sm font-bold text-gray-900 truncate">
                    {category.name} Top10
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                </Link>

                <ul>
                  {Array.from({ length: 10 }, (_, idx) => {
                    const item = items[idx];
                    return item ? (
                      <li key={item.id}>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          {idx < 3 ? (
                            <span className="text-lg leading-none shrink-0">{MEDALS[idx]}</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-orange-400 text-orange-400 text-xs font-bold shrink-0">
                              {idx + 1}
                            </span>
                          )}
                          <span className={`text-sm font-medium truncate ${RANK_COLORS[idx]}`}>
                            {item.name}
                          </span>
                        </a>
                      </li>
                    ) : (
                      <li key={`empty-${idx}`} className="flex items-center gap-3 px-4 py-2">
                        <span className="w-5 shrink-0" />
                        <span className="text-sm text-gray-300">빈 칸</span>
                      </li>
                    );
                  })}
                </ul>

              </div>
            );
          })}
        </div>
      </section>

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
