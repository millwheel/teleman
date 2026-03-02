"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
  useRouter,
  notFound,
} from "next/navigation";
import { COMMUNITY_CATEGORIES } from "@/data/communityCategories";
import type { CommunityPost, PostListResponse } from "@/data/type";
import type { JwtPayload } from "@/lib/auth";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import CategoryTabs from "@/components/post/CategoryTabs";
import WriteButton from "@/components/post/WriteButton";
import { PAGE_SIZE } from "@/data/constants";
import AdBannerSection from "@/components/ad/AdBannerSection";

export default function CommunityListPage() {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = params.category;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const cat = COMMUNITY_CATEGORIES.find((c) => c.key === category);
  const currentKey = `${category}-${page}`;
  const loading = loadedKey !== currentKey;

  useEffect(() => {
    if (!cat) return;
    let cancelled = false;
    fetch(`/api/community?category=${category}&page=${page}`)
      .then((r) => r.json())
      .then((res: PostListResponse) => {
        if (cancelled) return;
        setPosts(res.data as CommunityPost[]);
        setTotalCount(res.totalCount);
        setPageSize(res.pageSize);
        setLoadedKey(`${category}-${page}`);
      });
    return () => {
      cancelled = true;
    };
  }, [category, page, cat]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data));
  }, []);

  if (!cat) return notFound();

  return (
    <main className="max-w-7xl mx-auto px-4">
      <AdBannerSection />

      <div className="max-w-5xl mx-auto">
        <CategoryTabs current={category} />

        <PostList
          posts={posts}
          basePath={`/community/${category}`}
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
            onPageChange={(p) =>
              router.push(`/community/${category}?page=${p}`)
            }
          />
          <div className="flex-1 flex justify-end">
            <WriteButton
              href={`/community/${category}/write`}
              session={session}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
