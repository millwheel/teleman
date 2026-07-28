"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { LinkItem } from "@/data/type";
import LinkCategoryTabs from "@/components/LinkCategoryTabs";
import AdBannerSection from "@/components/ad/AdBannerSection";
import { Clock, Heart } from "lucide-react";
import { formatDateTime } from "@/util/date";

export default function LinkDetailPage() {
  const { code, id } = useParams<{ code: string; id: string }>();
  const [link, setLink] = useState<LinkItem | null>(null);

  useEffect(() => {
    fetch(`/api/links/item/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLink(data));
  }, [id]);

  if (!link) {
    return <div className="py-12 text-center text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      <LinkCategoryTabs currentCode={code} />
      <AdBannerSection />

      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-background overflow-hidden">
          {/* 상단 헤더 */}
          <div className="px-6 py-5">
            <h1 className="text-2xl font-bold mb-4">{link.name}</h1>

            {/* 2 layer: 좌측(이미지 + 링크 URL) / 우측(좋아요 + 작성일) */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {link.public_url && (
                  <Image
                    src={link.public_url}
                    alt={link.name}
                    width={120}
                    height={60}
                    className="shrink-0 object-cover rounded"
                    unoptimized
                  />
                )}
                <a
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {link.link}
                </a>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                  {link.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDateTime(link.created_at)}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mx-6" />

          {/* 중단 본문 */}
          <div className="px-6 py-5 min-h-[120px]">
            {link.description ? (
              <div
                className="prose max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img[data-align=center]]:block [&_img[data-align=center]]:mx-auto [&_img[data-align=right]]:block [&_img[data-align=right]]:ml-auto [&_img[data-align=right]]:mr-0"
                dangerouslySetInnerHTML={{ __html: link.description }}
              />
            ) : (
              <p className="text-sm text-gray-400">설명이 없습니다.</p>
            )}
          </div>

          <hr className="border-gray-200 mx-6" />

          <div className="px-6 py-4 flex justify-center">
            <Link
              href={`/link/${code}`}
              className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90"
            >
              목록으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
