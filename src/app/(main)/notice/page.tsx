import { headers } from "next/headers";
import type { NoticePost, PostListResponse } from "@/data/type";
import NoticeListClient from "./NoticeListClient";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NoticeListPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));

  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/notice?page=${page}`, { cache: "no-store" });
  const { data, totalCount, pageSize } = (await res.json()) as PostListResponse;

  return (
    <NoticeListClient
      posts={data as NoticePost[]}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
    />
  );
}
