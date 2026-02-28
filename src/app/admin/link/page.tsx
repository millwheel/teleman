"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import type { LinkItem } from "@/data/type";
import { LINK_CATEGORIES } from "@/data/linkCategories";

export default function LinkItemPage() {
  const [bannersByCode, setBannersByCode] = useState<Record<string, LinkItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      LINK_CATEGORIES.map((c) =>
        fetch(`/api/admin/links?categoryCode=${c.code}`).then((r) => r.json()),
      ),
    ).then((results) => {
      const byCode: Record<string, LinkItem[]> = {};
      LINK_CATEGORIES.forEach((c, i) => {
        byCode[c.code] = Array.isArray(results[i]) ? results[i] : [];
      });
      setBannersByCode(byCode);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">링크모음 관리</h1>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {LINK_CATEGORIES.map((cat) => {
          const catBanners = bannersByCode[cat.code] ?? [];
          return (
            <div key={cat.code} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between bg-primary px-3 py-2">
                <span className="text-xs font-bold text-white truncate">{cat.name}</span>
                <Link
                  href={`/admin/link/${cat.code}`}
                  className="ml-2 shrink-0 rounded p-1 hover:bg-white/20 transition-colors"
                  title="세부 관리"
                >
                  <Settings className="h-3.5 w-3.5 text-white" />
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="px-3 py-3 text-xs text-gray-300 text-center">로딩중...</div>
                ) : catBanners.length > 0 ? (
                  catBanners.map((b) => (
                    <div key={b.id} className="px-3 py-1.5 text-xs text-gray-600 truncate">
                      {b.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-gray-400 text-center">등록된 링크 없음</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
