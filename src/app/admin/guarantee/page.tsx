"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus } from "lucide-react";
import Image from "next/image";
import AddBannerModal from "@/components/modal/AddBannerModal";
import DeleteBannerModal from "@/components/modal/DeleteBannerModal";
import type { GuaranteeBanner } from "@/data/type";

const API_PATH = "/api/admin/guarantees";

export default function GuaranteePage() {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<GuaranteeBanner[]>([]);
  const [modal, setModal] = useState<"add" | "delete" | null>(null);
  const [selected, setSelected] = useState<GuaranteeBanner | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    const res = await fetch(API_PATH);
    const data = await res.json();
    setBanners(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(API_PATH);
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function openDelete(b: GuaranteeBanner) {
    setSelected(b);
    setModal("delete");
  }

  async function handleSuccess() {
    setModal(null);
    await fetchBanners();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">보증업체 관리</h1>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          배너 추가
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">로딩 중...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          등록된 배너가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <div className="relative" style={{ aspectRatio: "1 / 1" }}>
                <Image
                  src={b.public_url}
                  alt={b.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  onClick={() => openDelete(b)}
                  className="absolute top-1.5 right-1.5 rounded bg-red-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{b.name}</p>
                <a
                  href={b.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate block text-xs text-primary hover:underline"
                >
                  {b.link}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === "add" && (
        <AddBannerModal
          apiPath={API_PATH}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {modal === "delete" && selected && (
        <DeleteBannerModal
          banner={selected}
          apiPath={API_PATH}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
