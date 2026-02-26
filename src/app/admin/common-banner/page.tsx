"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import Image from "next/image";
import AddCommonBannerModal from "@/components/admin/AddCommonBannerModal";
import DeleteCommonBannerModal from "@/components/admin/DeleteCommonBannerModal";
import type { CommonCommonBanner } from "@/data/type";

const API_PATH = "/api/admin/common-banners";

const cols = {
  name:   "basis-[10%]",
  image:  "basis-[40%]",
  link:   "flex-1 min-w-0",
  action: "basis-[3%]",
} as const;

function CommonBannerSection({
  title,
  hint,
  banners,
  loading,
  onAdd,
  onDelete,
}: {
  title: string;
  hint: string;
  banners: CommonBanner[];
  loading: boolean;
  onAdd: () => void;
  onDelete: (b: CommonBanner) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          배너 추가
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
          <span className={cols.name}>이름</span>
          <span className={cols.image}>이미지</span>
          <span className={cols.link}>링크</span>
          <span className={cols.action}>관리</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">로딩 중...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16 text-gray-400">등록된 배너가 없습니다.</div>
        ) : (
          banners.map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-4 py-2 hover:bg-gray-50 transition-colors">
              <span className={`${cols.name} text-sm font-medium truncate`}>
                {b.name}
              </span>
              <div className={`${cols.image} relative overflow-hidden rounded`} style={{ height: "104px" }}>
                <Image src={b.public_url} alt={b.name} fill className="object-cover" />
              </div>
              <div className={cols.link}>
                <a
                  href={b.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate block text-primary hover:underline text-sm"
                >
                  {b.link}
                </a>
              </div>
              <div className={`${cols.action} flex justify-end`}>
                <button
                  onClick={() => onDelete(b)}
                  className="p-1.5 rounded hover:bg-red-50 text-eliminate transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CommonCommonBannerPage() {
  const [loading, setLoading] = useState(true);
  const [banners, setCommonBanners] = useState<CommonBanner[]>([]);
  const [modal, setModal] = useState<"add-long" | "add-short" | "delete" | null>(null);
  const [selected, setSelected] = useState<CommonBanner | null>(null);

  useEffect(() => {
    fetch(API_PATH)
      .then((res) => res.json())
      .then((data: CommonBanner[]) => {
        setCommonBanners(data);
        setLoading(false);
      });
  }, []);

  function openDelete(b: CommonBanner) {
    setSelected(b);
    setModal("delete");
  }

  async function handleSuccess() {
    setModal(null);
    setLoading(true);
    const res = await fetch(API_PATH);
    setCommonBanners(await res.json());
    setLoading(false);
  }

  const longCommonBanners = banners.filter((b) => b.type === "long");
  const shortCommonBanners = banners.filter((b) => b.type === "short");

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">광고배너 관리</h1>

      <CommonBannerSection
        title="긴 배너"
        hint="비율 6:1 · 권장 해상도 1260×210px"
        banners={longCommonBanners}
        loading={loading}
        onAdd={() => setModal("add-long")}
        onDelete={openDelete}
      />

      <CommonBannerSection
        title="짧은 배너"
        hint="비율 3:1 · 권장 해상도 630×210px"
        banners={shortCommonBanners}
        loading={loading}
        onAdd={() => setModal("add-short")}
        onDelete={openDelete}
      />

      {modal === "add-long" && (
        <AddCommonBannerModal
          apiPath={API_PATH}
          bannerType="long"
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {modal === "add-short" && (
        <AddCommonBannerModal
          apiPath={API_PATH}
          bannerType="short"
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {modal === "delete" && selected && (
        <DeleteCommonBannerModal
          banner={selected}
          apiPath={API_PATH}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
