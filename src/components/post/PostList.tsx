"use client";

import Link from "next/link";
import type { CommunityPost, NoticePost } from "@/data/type";
import { formatDateTime } from "@/util/date";

type PostListProps = {
  posts: (CommunityPost | NoticePost)[];
  basePath: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  loading?: boolean;
};

export default function PostList({
  posts,
  basePath,
  currentPage,
  pageSize,
  totalCount,
  loading = false,
}: PostListProps) {
  return (
    <div className="overflow-x-auto bg-background rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-primary text-center">
            <th className="py-3 px-2 w-16">번호</th>
            <th className="py-3 px-2 text-left">제목</th>
            <th className="py-3 px-2 w-26">작성자</th>
            <th className="py-3 px-2 w-26">작성날짜</th>
            <th className="py-3 px-2 w-16">조회</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-400">
                불러오는 중...
              </td>
            </tr>
          ) : posts.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-gray-400">
                게시글이 없습니다.
              </td>
            </tr>
          ) : (
            posts.map((post, idx) => {
              const rowNum = totalCount - (currentPage - 1) * pageSize - idx;
              const postHref = [basePath, post.id].join("/");
              return (
                <tr
                  key={post.id}
                  className="border-b border-gray-200 hover:bg-gray-50 text-center"
                >
                  <td className="py-3 px-2 text-gray-500">{rowNum}</td>
                  <td className="py-3 px-2 text-left">
                    <Link
                      href={postHref}
                      className="hover:text-secondary"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {post.author_nickname}
                  </td>
                  <td className="py-3 px-2 text-gray-500">
                    {formatDateTime(post.created_at)}
                  </td>
                  <td className="py-3 px-2 text-gray-500">{post.view_count}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
