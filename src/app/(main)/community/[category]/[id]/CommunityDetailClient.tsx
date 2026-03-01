"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { CommunityPost } from "@/data/type";
import type { JwtPayload } from "@/lib/auth";
import PostViewer from "@/components/post/PostViewer";
import CommentSection from "@/components/post/CommentSection";

type Props = {
  post: CommunityPost;
  category: string;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default function CommunityDetailClient({ post, category }: Props) {
  const router = useRouter();
  const [session, setSession] = useState<JwtPayload | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data));
  }, []);

  const canEdit = session && post.author_id === session.userId;
  const canDelete =
    session && (post.author_id === session.userId || session.role === "admin");

  const handleDelete = async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/community/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push(`/community/${category}`);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="border-b-2 border-primary pb-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{post.author_nickname}</span>
          <span>{formatDate(post.created_at)}</span>
          <span>조회 {post.view_count}</span>
        </div>
      </div>

      {/* 본문 */}
      <div className="min-h-[200px] mb-6">
        <PostViewer content={post.content} />
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <Link
          href={`/community/${category}`}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          목록
        </Link>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              href={`/community/${category}/${post.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              수정
            </Link>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-eliminate text-white rounded text-sm hover:opacity-90"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* 댓글 */}
      <CommentSection postId={post.id} apiBase="/api/community" />
    </main>
  );
}
