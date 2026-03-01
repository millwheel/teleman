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

export default function NoticeListClient({ posts, totalCount, page, pageSize }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<JwtPayload | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data));
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">공지사항</h1>

      {/* admin만 글쓰기 */}
      {session?.role === "admin" && (
        <div className="flex justify-end mb-4">
          <Link
            href="/notice/write"
            className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90"
          >
            글쓰기
          </Link>
        </div>
      )}

      <PostList
        posts={posts}
        basePath="/notice"
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
      />

      <Pagination
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={(p) => router.push(`/notice?page=${p}`)}
      />
    </main>
  );
}
