"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { LinkItem } from "@/data/type";
import { LINK_CATEGORIES } from "@/data/linkCategories";
import LinkForm from "@/components/admin/LinkForm";

export default function LinkEditPage() {
  const { categoryCode, id } = useParams<{ categoryCode: string; id: string }>();
  const router = useRouter();
  const category = LINK_CATEGORIES.find((c) => c.code === categoryCode);

  const [item, setItem] = useState<LinkItem | null>(null);

  useEffect(() => {
    fetch(`/api/links/item/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LinkItem | null) => {
        if (data) setItem(data);
      });
  }, [id]);

  if (!category) {
    return (
      <div className="text-center py-16 text-gray-400">
        카테고리를 찾을 수 없습니다.
      </div>
    );
  }

  if (!item) {
    return <div className="py-12 text-center text-gray-400">불러오는 중...</div>;
  }

  async function handleSubmit(data: {
    name: string;
    link: string;
    likes: number;
    description: string;
    imageFile: File | null;
  }) {
    if (!data.name || !data.link) {
      return "이름과 링크는 필수입니다.";
    }
    if (!data.imageFile && !item?.image_path) {
      return "이미지는 필수입니다.";
    }
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("link", data.link);
    fd.append("description", data.description);
    fd.append("likes", String(data.likes));
    if (item?.image_path) fd.append("image_path", item.image_path);
    if (data.imageFile) fd.append("file", data.imageFile);
    const res = await fetch(`/api/admin/links/${id}`, {
      method: "PUT",
      body: fd,
    });
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
      title="링크 수정"
      submitLabel="저장"
      isEdit
      defaultValues={{
        name: item.name,
        link: item.link,
        likes: item.likes,
        description: item.description ?? "",
      }}
      defaultPreview={item.public_url}
      onSubmit={handleSubmit}
    />
  );
}
