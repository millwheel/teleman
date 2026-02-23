"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import Image from "next/image";
import AddBannerModal from "@/components/admin/AddBannerModal";
import DeleteBannerModal from "@/components/admin/DeleteBannerModal";

interface Banner {
  id: number;
  name: string;
  link: string;
  public_url: string;
}

const API_PATH = "/api/admin/common-banners";

const cols = {
  name:   "basis-[10%]",
  image:  "basis-[40%]",
  link:   "flex-1 min-w-0",
  action: "basis-[3%]",
} as const;

export default function CommonBannerPage() {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modal, setModal] = useState<"add" | "delete" | null>(null);
  const [selected, setSelected] = useState<Banner | null>(null);

  useEffect(() => {
    fetch(API_PATH)
      .then((res) => res.json())
      .then((data: Banner[]) => {
        setBanners(data);
        setLoading(false);
      });
  }, []);

  function openDelete(b: Banner) {
    setSelected(b);
    setModal("delete");
  }

  async function handleSuccess() {
    setModal(null);
    setLoading(true);
    const res = await fetch(API_PATH);
    setBanners(await res.json());
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">광고배너 관리</h1>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          배너 추가
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        {/* 헤더 - 항상 표시 */}
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
          <span className={cols.name}>이름</span>
          <span className={cols.image}>이미지</span>
          <span className={cols.link}>링크</span>
          <span className={cols.action}>관리</span>
        </div>

        {/* 목록 - 삼항 연산자 */}
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
              <div className={`${cols.image} relative h-40 overflow-hidden rounded`}>
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
                  onClick={() => openDelete(b)}
                  className="p-1.5 rounded hover:bg-red-50 text-eliminate transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
