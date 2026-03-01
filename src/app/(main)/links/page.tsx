import { headers } from "next/headers";
import Image from "next/image";
import type { LinkItem } from "@/data/type";
import { LINK_CATEGORIES } from "@/data/linkCategories";
import AdBannerSection from "@/components/AdBannerSection";
import LinkCategoryCard from "@/components/LinkCategoryCard";

export default async function LinkCategoryPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/links`);
  const links: LinkItem[] = await res.json();

  const bannersByCategory = links.reduce<Record<string, LinkItem[]>>(
    (acc, banner) => {
      if (!acc[banner.category_code]) acc[banner.category_code] = [];
      acc[banner.category_code].push(banner);
      return acc;
    },
    {},
  );

  return (
    <div className="mx-auto max-w-7xl px-4">
      <AdBannerSection />

      <section className="py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {LINK_CATEGORIES.map((category) => (
            <LinkCategoryCard
              key={category.code}
              category={category}
              items={(bannersByCategory[category.code] ?? []).slice(0, 10)}
            />
          ))}
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
