"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CommunityPost } from "@/data/type";
import type { JwtPayload } from "@/lib/auth";
import PostViewer from "@/components/post/PostViewer";
import CommentSection from "@/components/post/CommentSection";
import { formatDateTime } from "@/util/date";

export default function CommunityDetailPage() {
  const params = useParams<{ category: string; id: string }>();
  const router = useRouter();
  const { category, id } = params;

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [session, setSession] = useState<JwtPayload | null>(null);

  useEffect(() => {
    fetch(`/api/community/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPost(data));
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data));
  }, [id]);

  if (!post) {
    return <div className="py-12 text-center text-gray-400">불러오는 중...</div>;
  }

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
      <div className="border-b-2 border-primary pb-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{post.author_nickname}</span>
          <span>{formatDateTime(post.created_at)}</span>
          <span>조회 {post.view_count}</span>
        </div>
      </div>

      <div className="min-h-[200px] mb-6">
        <PostViewer content={post.content} />
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <Link
          href={`/community/${category}`}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-pointer"
        >
          목록
        </Link>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              href={`/community/${category}/${post.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-pointer"
            >
              수정
            </Link>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-eliminate text-white rounded text-sm hover:opacity-90 cursor-pointer"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <CommentSection postId={post.id} apiBase="/api/community" />
    </main>
  );
}
