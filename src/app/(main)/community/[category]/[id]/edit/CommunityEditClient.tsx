"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CommunityPost } from "@/data/type";
import PostEditor from "@/components/post/PostEditor";

type Props = {
  post: CommunityPost;
  category: string;
};

export default function CommunityEditClient({ post, category }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력하세요.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/community/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content }),
    });

    if (res.ok) {
      router.push(`/community/${category}/${post.id}`);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? "글 수정에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">글 수정</h1>

      {error && <p className="text-eliminate text-sm mb-4">{error}</p>}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className="w-full border border-gray-300 rounded px-4 py-3 mb-4 text-lg"
      />

      <PostEditor initialContent={post.content} onChange={setContent} />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-primary text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "저장 중..." : "수정"}
        </button>
      </div>
    </main>
  );
}
