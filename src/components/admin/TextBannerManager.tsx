"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

interface Category {
  id: number;
  name: string;
  sort_order: number;
}

interface TextBanner {
  id: number;
  name: string;
  category_id: number;
}

interface Props {
  categories: Category[];
  bannersByCategory: Record<number, TextBanner[]>;
}

export default function TextBannerManager({ categories, bannersByCategory }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">링크모음 관리</h1>
        <Link
          href="/admin/text-banner-categories"
          className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
        >
          카테고리 관리
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {categories.map((cat) => {
          const banners = bannersByCategory[cat.id] ?? [];
          return (
            <div
              key={cat.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* 카테고리 헤더 */}
              <div className="flex items-center justify-between bg-secondary px-3 py-2">
                <span className="text-xs font-bold text-white truncate">{cat.name}</span>
                <Link
                  href={`/admin/text-banner?categoryId=${cat.id}`}
                  className="ml-2 shrink-0 rounded p-1 hover:bg-white/20 transition-colors"
                  title="세부 관리"
                >
                  <Settings className="h-3.5 w-3.5 text-white" />
                </Link>
              </div>

              {/* 배너 목록 */}
              <div className="divide-y divide-gray-100">
                {banners.length > 0 ? (
                  banners.map((b) => (
                    <div
                      key={b.id}
                      className="px-3 py-1.5 text-xs text-gray-600 truncate"
                    >
                      {b.name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-gray-400 text-center">
                    등록된 링크 없음
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="mt-10 text-center text-gray-400">
          <p>카테고리가 없습니다.</p>
          <Link
            href="/admin/text-banner-categories"
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            카테고리 관리에서 추가하기
          </Link>
        </div>
      )}
    </div>
  );
}
