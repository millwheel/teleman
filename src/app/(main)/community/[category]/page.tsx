import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { COMMUNITY_CATEGORIES } from "@/data/communityCategories";
import type { CommunityPost, PostListResponse } from "@/data/type";
import PostList from "@/components/post/PostList";
import Pagination from "@/components/Pagination";
import CommunityListClient from "./CommunityListClient";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CommunityListPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page: pageStr } = await searchParams;

  const cat = COMMUNITY_CATEGORIES.find((c) => c.key === category);
  if (!cat) notFound();

  const page = Math.max(1, Number(pageStr ?? 1));
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(
    `${proto}://${host}/api/community?category=${category}&page=${page}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();
  const { data, totalCount, pageSize } = (await res.json()) as PostListResponse;

  return (
    <CommunityListClient
      category={category}
      posts={data as CommunityPost[]}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
    />
  );
}
