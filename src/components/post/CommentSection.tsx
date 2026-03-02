"use client";

import { useState, useEffect, useCallback } from "react";
import type { PostComment } from "@/data/type";
import type { JwtPayload } from "@/lib/auth";
import { formatDateTime } from "@/util/date";

type CommentSectionProps = {
  postId: number;
  apiBase: string; // e.g. "/api/community" or "/api/notice"
};

export default function CommentSection({
  postId,
  apiBase,
}: CommentSectionProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [session, setSession] = useState<JwtPayload | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`${apiBase}/${postId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  }, [apiBase, postId]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase}/${postId}/comments`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) setComments(data);
      });
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setSession(data);
      });
    return () => { cancelled = true; };
  }, [apiBase, postId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch(`${apiBase}/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment.trim() }),
    });
    if (res.ok) {
      setNewComment("");
      await fetchComments();
    }
    setSubmitting(false);
  };

  const handleUpdate = async (commentId: number) => {
    if (!editContent.trim()) return;
    const res = await fetch(`${apiBase}/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditContent("");
      await fetchComments();
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const res = await fetch(`${apiBase}/comments/${commentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchComments();
    }
  };

  const canModify = (comment: PostComment) =>
    session && comment.author_id === session.userId;

  const canDelete = (comment: PostComment) =>
    session &&
    (comment.author_id === session.userId || session.role === "admin");

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">
        댓글 {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* 댓글 목록 */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {comment.author_nickname}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDateTime(comment.created_at)}
                </span>
              </div>
              <div className="flex gap-2">
                {canModify(comment) && (
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-xs text-gray-500 hover:text-secondary cursor-pointer"
                  >
                    수정
                  </button>
                )}
                {canDelete(comment) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-gray-500 hover:text-eliminate cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>

            {editingId === comment.id ? (
              <div className="flex gap-2">
                <input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleUpdate(comment.id)}
                  className="px-3 py-2 bg-primary text-white rounded text-sm hover:opacity-90 cursor-pointer"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 cursor-pointer"
                >
                  취소
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700">{comment.content}</p>
            )}
          </div>
        ))}
      </div>

      {/* 댓글 작성 */}
      {session ? (
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSubmit()
            }
            placeholder="댓글을 입력하세요..."
            className="flex-1 bg-background border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            등록
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">
          로그인 후 댓글을 작성할 수 있습니다.
        </p>
      )}
    </div>
  );
}
