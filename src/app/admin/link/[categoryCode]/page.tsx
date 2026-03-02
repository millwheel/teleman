"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/modal/Modal";
import type { LinkItem } from "@/data/type";
import { LINK_CATEGORIES } from "@/data/linkCategories";

export default function LinkItemDetailPage({
  params,
}: {
  params: Promise<{ categoryCode: string }>;
}) {
  const { categoryCode } = use(params);
  const router = useRouter();

  const category = LINK_CATEGORIES.find((c) => c.code === categoryCode) ?? null;
  const [banners, setBanners] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LinkItem | null>(null);

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/admin/links?categoryCode=${categoryCode}`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    }
    init();
  }, [categoryCode]);

  async function refetch() {
    const res = await fetch(`/api/admin/links?categoryCode=${categoryCode}`);
    const data = await res.json();
    setBanners(Array.isArray(data) ? data : []);
    router.refresh();
  }

  if (!category) {
    return (
      <div className="text-center py-16 text-gray-400">
        카테고리를 찾을 수 없습니다.
      </div>
    );
  }

  const cat = category;

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    await fetch(`/api/admin/links/${deleteTarget.id}`, { method: "DELETE" });
    setLoading(false);
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/link"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            링크모음 관리
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-foreground">{cat.name}</h1>
          <span className="text-sm text-gray-400">({banners.length}개)</span>
        </div>
        <Link
          href={`/admin/link/${categoryCode}/write`}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          링크 추가
        </Link>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          등록된 링크가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <div className="relative" style={{ aspectRatio: "16 / 9" }}>
                {b.public_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={b.public_url}
                    alt={b.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-300">
                    이미지 없음
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5 space-y-1">
                <p className="text-sm font-semibold truncate">{b.name}</p>
                <a
                  href={b.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate block text-xs text-primary hover:underline"
                >
                  {b.link}
                </a>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-rose-500">
                    <Heart className="h-3 w-3 fill-rose-500" />
                    {b.likes.toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/link/${categoryCode}/${b.id}/edit`}
                      className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(b)}
                      className="p-1.5 rounded hover:bg-red-50 text-eliminate transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <Modal title="배너 삭제" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-foreground">
                {deleteTarget.name}
              </span>{" "}
              배너를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-eliminate px-4 py-2 text-sm font-semibold text-white hover:bg-eliminate-light disabled:opacity-60 transition-colors cursor-pointer"
              >
                {loading ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
