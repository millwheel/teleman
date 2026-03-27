"use client";

import { useState, useRef } from "react";
import Modal from "./Modal";
import type { BannerType } from "@/data/type";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from "@/util/file";

type Props = {
  apiPath: string;
  bannerType?: BannerType;
  onClose: () => void;
  onSuccess: () => void;
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

export default function AddBannerModal({ apiPath, bannerType, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_FILE_SIZE) {
      setError(`파일 크기가 ${MAX_FILE_SIZE_LABEL}를 초과합니다.`);
      e.target.value = "";
      return;
    }
    setError("");
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleAdd() {
    setError("");
    if (!name || !link || !file) {
      setError("모든 항목을 입력하세요.");
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("link", link);
    if (bannerType) fd.append("type", bannerType);
    fd.append("file", file);
    const res = await fetch(apiPath, { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.message); return; }
    onSuccess();
  }

  return (
    <Modal title="항목 추가" onClose={onClose}>
      <div className="space-y-4">
        {bannerType && (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            배너 종류: <span className="font-semibold text-primary">
              {bannerType === "long" ? "긴 배너 (6:1)" : "짧은 배너 (3:1)"}
            </span>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">링크</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://t.me/..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">이미지</label>
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
            className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            {file ? file.name : "클릭하여 이미지 선택"}
          </button>
          {preview && (
            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="미리보기" className="h-40 w-full object-cover" />
            </div>
          )}
        </div>
        {error && <p className="text-sm text-eliminate">{error}</p>}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loading ? "업로드 중..." : "추가"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
