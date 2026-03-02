"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { NoticePost, PostListResponse } from "@/data/type";
import type { JwtPayload } from "@/lib/auth";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import WriteButton from "@/components/post/WriteButton";
import { PAGE_SIZE } from "@/data/constants";
import AdBannerSection from "@/components/ad/AdBannerSection";

function NoticeListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const [posts, setPosts] = useState<NoticePost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);

  const loading = loadedPage !== page;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/notice?page=${page}`)
      .then((r) => r.json())
      .then((res: PostListResponse) => {
        if (cancelled) return;
        setPosts(res.data as NoticePost[]);
        setTotalCount(res.totalCount);
        setPageSize(res.pageSize);
        setLoadedPage(page);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4">
      <AdBannerSection />

      <div className="max-w-5xl mx-auto">
        <PostList
          posts={posts}
          basePath="/notice"
          currentPage={page}
          pageSize={pageSize}
          totalCount={totalCount}
          loading={loading}
        />

        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <Pagination
            totalCount={totalCount}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={(p) => router.push(`/notice?page=${p}`)}
          />
          <div className="flex-1 flex justify-end">
            <WriteButton href="/notice/write" session={session} adminOnly />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function NoticeListPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-400">불러오는 중...</div>}>
      <NoticeListContent />
    </Suspense>
  );
}
