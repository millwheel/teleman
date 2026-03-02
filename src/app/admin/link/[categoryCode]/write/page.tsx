"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { LINK_CATEGORIES } from "@/data/linkCategories";
import LinkForm from "@/components/admin/LinkForm";

export default function LinkWritePage({
  params,
}: {
  params: Promise<{ categoryCode: string }>;
}) {
  const { categoryCode } = use(params);
  const router = useRouter();
  const category = LINK_CATEGORIES.find((c) => c.code === categoryCode);

  if (!category) {
    return (
      <div className="text-center py-16 text-gray-400">
        카테고리를 찾을 수 없습니다.
      </div>
    );
  }

  async function handleSubmit(data: {
    name: string;
    link: string;
    likes: number;
    description: string;
    imageFile: File | null;
  }) {
    if (!data.name || !data.link || !data.imageFile) {
      return "이름, 링크, 이미지는 필수입니다.";
    }
    const fd = new FormData();
    fd.append("category_code", categoryCode);
    fd.append("name", data.name);
    fd.append("link", data.link);
    fd.append("description", data.description);
    fd.append("likes", String(data.likes));
    fd.append("file", data.imageFile);
    const res = await fetch("/api/admin/links", { method: "POST", body: fd });
    if (!res.ok) {
      const json = await res.json();
      return json.message;
    }
    router.push(`/admin/link/${categoryCode}`);
    return null;
  }

  return (
    <LinkForm
      categoryCode={categoryCode}
      categoryName={category.name}
      title="링크 추가"
      submitLabel="추가"
      onSubmit={handleSubmit}
    />
  );
}
