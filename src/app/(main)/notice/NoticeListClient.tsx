"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { NoticePost } from "@/data/type";
import type { JwtPayload } from "@/lib/auth";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";

type Props = {
  posts: NoticePost[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export default function NoticeListClient({
  posts,
  totalCount,
  page,
  pageSize,
}: Props) {
  const router = useRouter();
  const [session, setSession] = useState<JwtPayload | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data));
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <PostList
        posts={posts}
        basePath="/notice"
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
          onPageChange={(p) => router.push(`/notice?page=${p}`)}
        />
        <div className="flex-1 flex justify-end">
          {session?.role === "admin" && (
            <Link
              href="/notice/write"
              className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90"
            >
              글쓰기
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
