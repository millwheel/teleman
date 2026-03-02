"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { NoticePost } from "@/data/type";
import type { JwtPayload } from "@/lib/auth";
import PostViewer from "@/components/post/PostViewer";
import DeleteBannerModal from "@/components/modal/DeleteBannerModal";
import AdBannerSection from "@/components/ad/AdBannerSection";
import { formatDateTime } from "@/util/date";

export default function NoticeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { id } = params;

  const [post, setPost] = useState<NoticePost | null>(null);
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/notice/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPost(data));
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data));
  }, [id]);

  if (!post) {
    return (
      <div className="py-12 text-center text-gray-400">불러오는 중...</div>
    );
  }

  const isAdmin = session?.role === "admin";

  const handleDeleteSuccess = () => {
    setShowDelete(false);
    router.push("/notice");
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
          href="/notice"
          className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90 cursor-pointer"
        >
          목록으로
        </Link>
        {isAdmin && (
          <div className="absolute right-0 flex gap-2">
            <Link
              href={`/notice/${post.id}/edit`}
              className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90 cursor-pointer"
            >
              수정
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="px-4 py-2 bg-eliminate text-white rounded text-sm hover:opacity-90 cursor-pointer"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {showDelete && (
        <DeleteBannerModal
          banner={{ id: post.id, name: post.title }}
          apiPath="/api/notice"
          label="공지사항"
          onClose={() => setShowDelete(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
      </div>
    </main>
  );
}
