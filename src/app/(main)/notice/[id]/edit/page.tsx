"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { NoticePost } from "@/data/type";
import PostEditor from "@/components/post/PostEditor";

export default function NoticeEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { id } = params;

  const [post, setPost] = useState<NoticePost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/notice/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: NoticePost | null) => {
        if (data) {
          setPost(data);
          setTitle(data.title);
          setContent(data.content);
        }
      });
  }, [id]);

  if (!post) {
    return (
      <div className="py-12 text-center text-gray-400">불러오는 중...</div>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력하세요.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/notice/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content }),
    });

    if (res.ok) {
      router.push(`/notice/${post.id}`);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? "글 수정에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">공지사항 수정</h1>

      {error && <p className="text-eliminate text-sm mb-4">{error}</p>}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full bg-background border border-gray-300 rounded px-4 py-3 mb-4 text-lg"
      />

      <PostEditor initialContent={post.content} onChange={setContent} />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-pointer"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-primary text-white rounded text-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "저장 중..." : "수정"}
        </button>
      </div>
    </main>
  );
}
