"use client";

import { useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PostEditor from "@/components/post/PostEditor";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from "@/util/file";
import { isHttpUrl, trimUrl } from "@/util/url";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

type LinkFormData = {
  name: string;
  link: string;
  likes: number;
  description: string;
  imageFile: File | null;
};

type LinkFormProps = {
  categoryCode: string;
  categoryName: string;
  title: string;
  submitLabel: string;
  isEdit?: boolean;
  defaultValues?: { name: string; link: string; likes: number; description: string };
  defaultPreview?: string | null;
  onSubmit: (data: LinkFormData) => Promise<string | null>;
};

export default function LinkForm({
  categoryCode,
  categoryName,
  title,
  submitLabel,
  isEdit,
  defaultValues,
  defaultPreview,
  onSubmit,
}: LinkFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [link, setLink] = useState(defaultValues?.link ?? "");
  const [likes, setLikes] = useState(defaultValues?.likes ?? 0);
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(defaultPreview ?? null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE) {
      setFormError(`파일 크기가 ${MAX_FILE_SIZE_LABEL}를 초과합니다.`);
      e.target.value = "";
      return;
    }
    setFormError("");
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : (defaultPreview ?? null));
  }

  async function handleSubmit() {
    setFormError("");
    const normalizedLink = trimUrl(link);
    if (!isHttpUrl(normalizedLink)) {
      setFormError("링크는 http:// 또는 https://로 시작해야 합니다.");
      return;
    }
    setLoading(true);
    const error = await onSubmit({ name, link: normalizedLink, likes, description, imageFile });
    setLoading(false);
    if (error) setFormError(error);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/admin/link/${categoryCode}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {categoryName}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="배너 표시 이름"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              좋아요 수
            </label>
            <input
              type="number"
              min={0}
              value={likes}
              onChange={(e) => setLikes(Math.max(0, parseInt(e.target.value) || 0))}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            링크
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://t.me/..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            썸네일
            {isEdit && (
              <span className="ml-1 text-gray-400 font-normal">(변경 시 선택)</span>
            )}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-5 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            {imageFile ? imageFile.name : "클릭하여 이미지 선택"}
          </button>
          {imagePreview && (
            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="미리보기"
                className="max-h-48 w-full object-contain bg-gray-50"
              />
            </div>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            설명 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <PostEditor
            initialContent={defaultValues?.description ?? ""}
            onChange={setDescription}
          />
        </div>

        {formError && <p className="text-sm text-eliminate">{formError}</p>}

        <div className="flex gap-2 justify-end pt-2">
          <Link
            href={`/admin/link/${categoryCode}`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loading ? "처리 중..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
