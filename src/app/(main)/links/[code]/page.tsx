import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { LinkItem } from "@/data/type";
import { LINK_CATEGORIES } from "@/data/linkCategories";
import AdBannerSection from "@/components/AdBannerSection";
import LinkCategoryTabs from "../../../../components/LinkCategoryTabs";
import LinkCard from "@/components/LinkCard";

export default async function LinkCategoryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const category = LINK_CATEGORIES.find((c) => c.code === code);
  if (!category) notFound();

  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/links/${code}`);
  const { links = [] }: { links: LinkItem[] } = await res.json();

  return (
    <div className="mx-auto max-w-7xl px-4">
      <LinkCategoryTabs currentCode={code} />
      <AdBannerSection />

      <div className="mt-6 mb-4">
        <h2 className="text-xl font-bold">{category.name}</h2>
      </div>

      <div className="grid grid-cols-5 gap-3 pb-8">
        {links.map((link, idx) => (
          <LinkCard key={link.id} link={link} rank={idx + 1} />
        ))}
        {links.length === 0 && (
          <p className="col-span-5 py-16 text-center text-gray-400">등록된 링크가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
