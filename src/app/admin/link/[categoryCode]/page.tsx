"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/admin/Modal";
import type { LinkItem, BannerFormState } from "@/data/type";
import { LINK_CATEGORIES } from "@/data/linkCategories";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

const EMPTY_FORM: BannerFormState = { name: "", link: "", description: "", likes: 0 };

export default function LinkItemDetailPage({
  params,
}: {
  params: Promise<{ categoryCode: string }>;
}) {
  const { categoryCode } = use(params);
  const router = useRouter();

  const category = LINK_CATEGORIES.find((c) => c.code === categoryCode) ?? null;
  const [banners, setBanners] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<LinkItem | null>(null);
  const [form, setForm] = useState<BannerFormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/admin/links?categoryCode=${categoryCode}`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    }
    init();
  }, [categoryCode]);

  async function refetch() {
    const res = await fetch(`/api/admin/links?categoryCode=${categoryCode}`);
    const data = await res.json();
    setBanners(Array.isArray(data) ? data : []);
    router.refresh();
  }

  if (!category) {
    return <div className="text-center py-16 text-gray-400">카테고리를 찾을 수 없습니다.</div>;
  }

  const cat = category;
  const atLimit = banners.length >= 10;

  function openAdd() {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setFormError("");
    setModal("add");
  }
  function openEdit(b: LinkItem) {
    setSelected(b);
    setForm({ name: b.name, link: b.link, description: b.description ?? "", likes: b.likes });
    setImageFile(null);
    setImagePreview(b.public_url ?? null);
    setFormError("");
    setModal("edit");
  }
  function openDelete(b: LinkItem) { setSelected(b); setModal("delete"); }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : (selected?.public_url ?? null));
  }

  async function handleAdd() {
    setFormError("");
    if (!form.name || !form.link || !imageFile) {
      setFormError("이름, 링크, 이미지는 필수입니다.");
      return;
    }
    setLoading("add");
    const fd = new FormData();
    fd.append("category_code", cat.code);
    fd.append("name", form.name);
    fd.append("link", form.link);
    fd.append("description", form.description);
    fd.append("likes", String(form.likes));
    fd.append("file", imageFile);
    const res = await fetch("/api/admin/links", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) { setFormError(data.message); return; }
    setModal(null);
    refetch();
  }

  async function handleEdit() {
    if (!selected) return;
    setFormError("");
    if (!form.name || !form.link) {
      setFormError("이름과 링크는 필수입니다.");
      return;
    }
    if (!imageFile && !selected.image_path) {
      setFormError("이미지는 필수입니다.");
      return;
    }
    setLoading("edit");
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("link", form.link);
    fd.append("description", form.description);
    fd.append("likes", String(form.likes));
    if (selected.image_path) fd.append("image_path", selected.image_path);
    if (imageFile) fd.append("file", imageFile);
    const res = await fetch(`/api/admin/links/${selected.id}`, { method: "PUT", body: fd });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) { setFormError(data.message); return; }
    setModal(null);
    refetch();
  }

  async function handleDelete() {
    if (!selected) return;
    setLoading("delete");
    await fetch(`/api/admin/links/${selected.id}`, { method: "DELETE" });
    setLoading(null);
    setModal(null);
    refetch();
  }

  const imageUploadField = (isEdit?: boolean) => {
    const hasExisting = isEdit && selected?.image_path;
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          이미지{hasExisting && <span className="ml-1 text-gray-400 font-normal">(변경 시 선택)</span>}
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
            <img src={imagePreview} alt="미리보기" className="max-h-48 w-full object-contain bg-gray-50" />
          </div>
        )}
      </div>
    );
  };

  const formFields = (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="배너 표시 이름"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">링크</label>
        <input
          type="url"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          placeholder="https://t.me/..."
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">좋아요 수</label>
        <input
          type="number"
          min={0}
          value={form.likes}
          onChange={(e) => setForm({ ...form, likes: Math.max(0, parseInt(e.target.value) || 0) })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          설명 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="간단한 설명"
          rows={2}
          className={inputClass}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/link"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            링크모음 관리
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-foreground">{cat.name}</h1>
          <span className="text-sm text-gray-400">({banners.length}/10)</span>
        </div>
        <button
          onClick={openAdd}
          disabled={atLimit}
          title={atLimit ? "최대 10개까지 등록 가능합니다." : ""}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          링크 추가
        </button>
      </div>

      {atLimit && (
        <p className="mb-4 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          최대 10개 한도에 도달했습니다. 기존 항목을 삭제 후 추가할 수 있습니다.
        </p>
      )}

      {banners.length === 0 ? (
        <div className="text-center py-16 text-gray-400">등록된 링크가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {banners.map((b) => (
            <div key={b.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="relative" style={{ aspectRatio: "16 / 9" }}>
                {b.public_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={b.public_url} alt={b.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-300">
                    이미지 없음
                  </div>
                )}
              </div>
              <div className="px-3 py-2.5 space-y-1">
                <p className="text-sm font-semibold truncate">{b.name}</p>
                <a
                  href={b.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate block text-xs text-primary hover:underline"
                >
                  {b.link}
                </a>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-rose-500">
                    <Heart className="h-3 w-3 fill-rose-500" />
                    {b.likes.toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => openDelete(b)}
                      className="p-1.5 rounded hover:bg-red-50 text-eliminate transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === "add" && (
        <Modal title="링크 추가" onClose={() => setModal(null)}>
          <div className="space-y-4">
            {formFields}
            {imageUploadField()}
            {formError && <p className="text-sm text-eliminate">{formError}</p>}
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={loading === "add"}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {loading === "add" ? "처리 중..." : "추가"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title="배너 수정" onClose={() => setModal(null)}>
          <div className="space-y-4">
            {formFields}
            {imageUploadField(true)}
            {formError && <p className="text-sm text-eliminate">{formError}</p>}
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEdit}
                disabled={loading === "edit"}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {loading === "edit" ? "처리 중..." : "저장"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === "delete" && selected && (
        <Modal title="배너 삭제" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-foreground">{selected.name}</span>{" "}
              배너를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={loading === "delete"}
                className="rounded-lg bg-eliminate px-4 py-2 text-sm font-semibold text-white hover:bg-eliminate-light disabled:opacity-60 transition-colors cursor-pointer"
              >
                {loading === "delete" ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
