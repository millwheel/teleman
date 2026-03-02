"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CommunityPost } from "@/data/type";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import CategoryTabs from "@/components/post/CategoryTabs";

type Props = {
  category: string;
  posts: CommunityPost[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export default function CommunityListClient({
  category,
  posts,
  totalCount,
  page,
  pageSize,
}: Props) {
  const router = useRouter();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <CategoryTabs current={category} />

      {/* 게시글 목록 */}
      <PostList
        posts={posts}
        basePath={`/community/${category}`}
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />

      {/* 페이지네이션 + 글쓰기 */}
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <Pagination
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={(p) => router.push(`/community/${category}?page=${p}`)}
        />
        <div className="flex-1 flex justify-end">
          <Link
            href={`/community/${category}/write`}
            className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90"
          >
            글쓰기
          </Link>
        </div>
      </div>
    </main>
  );
}
