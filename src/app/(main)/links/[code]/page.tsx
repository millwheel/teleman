import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CommonBanner, LinkItem } from "@/data/type";
import { LINK_CATEGORIES } from "@/data/linkCategories";
import { shuffle } from "@/util/shuffle";
import AdBannerGrid from "@/components/AdBannerGrid";
import LinkCategoryTabs from "../../../../components/LinkCategoryTabs";

const MEDALS = ["🥇", "🥈", "🥉"];

function LinkCard({ link, rank }: { link: LinkItem; rank: number }) {
  return (
    <a
      href={link.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white"
    >
      <div className="relative">
        {link.image_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.image_path}
            alt={link.name}
            className="w-full object-cover"
            style={{ height: "120px" }}
          />
        ) : (
          <div className="w-full bg-gray-100" style={{ height: "120px" }} />
        )}

        <div className="absolute top-1.5 left-1.5">
          {rank <= 3 ? (
            <span className="text-2xl leading-none">{MEDALS[rank - 1]}</span>
          ) : (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700/80 text-white text-xs font-bold">
              {rank}
            </span>
          )}
        </div>
      </div>

      <div className="px-2 py-2 flex items-center justify-between gap-1">
        <span className={`text-sm font-medium truncate ${rank <= 3 ? "text-primary" : "text-gray-800"}`}>
          {link.name}
        </span>
        <span className="flex items-center gap-0.5 text-xs text-gray-400 shrink-0">
          <span className="text-red-400">♥</span>
          {link.likes}
        </span>
      </div>
    </a>
  );
}

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
  const { banners = [], links = [] }: { banners: CommonBanner[]; links: LinkItem[] } = await res.json();

  return (
    <div className="mx-auto max-w-7xl px-4">
      <LinkCategoryTabs currentCode={code} />
      <AdBannerGrid banners={shuffle(banners)} />

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
