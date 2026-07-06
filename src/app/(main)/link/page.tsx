import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import type { LinkItem, NoticePost, PostListResponse } from "@/data/type";
import { LINK_CATEGORIES } from "@/data/linkCategories";
import AdBannerSection from "@/components/ad/AdBannerSection";
import LinkCategoryCard from "@/components/LinkCategoryCard";
import { formatDateTime } from "@/util/date";

function NoticePreviewSection({ notice }: { notice: NoticePost | null }) {
  return (
    <section className="pt-8">
      <h2 className="mb-4 text-center text-4xl font-black tracking-wide text-[#ad9355] [text-shadow:0_1px_0_#6d5428,1px_2px_0_#6d5428,2px_4px_4px_#9b9b9b] max-md:text-3xl">
        공지사항
      </h2>

      <div className="grid min-h-[156px] grid-cols-[minmax(0,1fr)_128px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm max-md:min-h-[144px] max-md:grid-cols-[minmax(0,1fr)_86px]">
        <div className="py-4">
          <div className="border-b-2 border-primary px-4 py-4">
            <div className="grid grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_4rem] items-center gap-3 text-sm font-bold text-gray-900 max-md:grid-cols-[2.5rem_minmax(0,1fr)_4rem]">
              <span className="text-center">번호</span>
              <span>제목</span>
              <span className="text-center max-md:hidden">작성자</span>
              <span className="text-center max-md:hidden">작성날짜</span>
              <span className="text-center">조회</span>
            </div>
          </div>

          {notice ? (
            <Link
              href={`/notice/${notice.id}`}
              className="grid min-h-[52px] grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_4rem] items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 max-md:grid-cols-[2.5rem_minmax(0,1fr)_4rem]"
            >
              <span className="text-center text-gray-700">1</span>
              <span className="overflow-hidden text-base font-bold text-gray-900 max-md:text-sm">
                <span className="notice-marquee inline-block whitespace-nowrap">
                  {notice.title}
                </span>
              </span>
              <span className="text-center text-gray-700 max-md:hidden">
                {notice.author_nickname}
              </span>
              <span className="text-center text-gray-600 max-md:hidden">
                {formatDateTime(notice.created_at)}
              </span>
              <span className="text-center text-gray-700">
                {notice.view_count}
              </span>
            </Link>
          ) : (
            <div className="grid min-h-[104px] grid-cols-[3rem_minmax(0,1fr)_7rem_7rem_4rem] items-center gap-3 px-4 py-3 text-sm text-gray-400 max-md:grid-cols-[2.5rem_minmax(0,1fr)_4rem]">
              <span className="text-center">-</span>
              <span className="truncate">등록된 공지사항이 없습니다.</span>
              <span className="text-center max-md:hidden">-</span>
              <span className="text-center max-md:hidden">-</span>
              <span className="text-center">-</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-center bg-white px-3 pb-4 pt-5">
          <Image
            src="/images/notice.jpg"
            alt="공지사항 캐릭터"
            width={120}
            height={120}
            className="h-[132px] w-auto object-contain max-md:h-[96px]"
            priority
          />
        </div>
      </div>
    </section>
  );
}

export default async function LinkCategoryPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const [linksRes, noticeRes] = await Promise.all([
    fetch(`${proto}://${host}/api/links`),
    fetch(`${proto}://${host}/api/notice?page=1`),
  ]);
  const links: LinkItem[] = await linksRes.json();
  const noticeList: PostListResponse = await noticeRes.json();
  const latestNotice = (noticeList.data[0] as NoticePost | undefined) ?? null;

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
      <NoticePreviewSection notice={latestNotice} />

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
