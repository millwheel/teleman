"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { COMMUNITY_CATEGORIES } from "@/data/communityCategories";
import type { CommunityPost } from "@/data/type";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";

type Props = {
  category: string;
  posts: CommunityPost[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export default function CommunityListClient({ category, posts, totalCount, page, pageSize }: Props) {
  const router = useRouter();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">커뮤니티</h1>

      {/* 카테고리 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-300">
        {COMMUNITY_CATEGORIES.map((cat) => (
          <Link
            key={cat.key}
            href={`/community/${cat.key}`}
            className={cn(
              "px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors",
              category === cat.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* 글쓰기 버튼 */}
      <div className="flex justify-end mb-4">
        <Link
          href={`/community/${category}/write`}
          className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90"
        >
          글쓰기
        </Link>
      </div>

      {/* 게시글 목록 */}
      <PostList
        posts={posts}
        basePath={`/community/${category}`}
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />

      {/* 페이지네이션 */}
      <Pagination
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={(p) => router.push(`/community/${category}?page=${p}`)}
      />
    </main>
  );
}
