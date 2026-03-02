"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CommunityPost } from "@/data/type";
import type { JwtPayload } from "@/lib/auth";
import PostViewer from "@/components/post/PostViewer";
import CommentSection from "@/components/post/CommentSection";
import DeleteBannerModal from "@/components/modal/DeleteBannerModal";
import AdBannerSection from "@/components/ad/AdBannerSection";
import { formatDateTime } from "@/util/date";

export default function CommunityDetailPage() {
  const params = useParams<{ category: string; id: string }>();
  const router = useRouter();
  const { category, id } = params;

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [showDelete, setShowDelete] = useState(false);

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

  const handleDeleteSuccess = () => {
    setShowDelete(false);
    router.push(`/community/${category}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-4">
      <AdBannerSection />

      <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white overflow-hidden">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{post.author_nickname}</span>
            <span>{formatDateTime(post.created_at)}</span>
            <span>조회 {post.view_count}</span>
          </div>
        </div>

        <hr className="border-gray-200 mx-6" />

        <div className="min-h-[200px]">
          <PostViewer content={post.content} />
        </div>
      </div>

      <div className="relative flex justify-center items-center pt-4">
        <Link
          href={`/community/${category}`}
          className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90 cursor-pointer"
        >
          목록으로
        </Link>
        <div className="absolute right-0 flex gap-2">
          {canEdit && (
            <Link
              href={`/community/${category}/${post.id}/edit`}
              className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90 cursor-pointer"
            >
              수정
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDelete(true)}
              className="px-4 py-2 bg-eliminate text-white rounded text-sm hover:opacity-90 cursor-pointer"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <CommentSection postId={post.id} apiBase="/api/community" />

      {showDelete && (
        <DeleteBannerModal
          banner={{ id: post.id, name: post.title }}
          apiPath="/api/community"
          label="게시글"
          onClose={() => setShowDelete(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
      </div>
    </main>
  );
}
