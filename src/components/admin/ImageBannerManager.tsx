"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import Modal from "./Modal";
import { getPublicImageUrl } from "@/lib/storage";

interface Banner {
  id: number;
  name: string;
  link: string;
  image_url: string;
}

interface Props {
  banners: Banner[];
  apiPath: string;       // "/api/admin/image-banners" | "/api/admin/common-banners"
  title: string;
}

interface EditForm {
  name: string;
  link: string;
}

export default function ImageBannerManager({ banners, apiPath, title }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | string | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Banner | null>(null);

  // 추가 폼 상태
  const [addName, setAddName] = useState("");
  const [addLink, setAddLink] = useState("");
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addPreview, setAddPreview] = useState<string | null>(null);
  const [addError, setAddError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 수정 폼 상태
  const [editForm, setEditForm] = useState<EditForm>({ name: "", link: "" });
  const [editError, setEditError] = useState("");

  function openAdd() {
    setAddName(""); setAddLink(""); setAddFile(null); setAddPreview(null); setAddError("");
    setModal("add");
  }

  function openEdit(b: Banner) {
    setSelected(b);
    setEditForm({ name: b.name, link: b.link });
    setEditError("");
    setModal("edit");
  }

  function openDelete(b: Banner) {
    setSelected(b);
    setModal("delete");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAddFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setAddPreview(url);
    } else {
      setAddPreview(null);
    }
  }

  async function handleAdd() {
    setAddError("");
    if (!addName || !addLink || !addFile) {
      setAddError("모든 항목을 입력하세요.");
      return;
    }
    setLoading("add");
    const fd = new FormData();
    fd.append("name", addName);
    fd.append("link", addLink);
    fd.append("file", addFile);

    const res = await fetch(apiPath, { method: "POST", body: fd });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) { setAddError(data.message); return; }
    setModal(null);
    router.refresh();
  }

  async function handleEdit() {
    if (!selected) return;
    setEditError("");
    if (!editForm.name || !editForm.link) {
      setEditError("이름과 링크를 입력하세요.");
      return;
    }
    setLoading("edit");
    const res = await fetch(`${apiPath}/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) { setEditError(data.message); return; }
    setModal(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!selected) return;
    setLoading("delete");
    await fetch(`${apiPath}/${selected.id}`, { method: "DELETE" });
    setLoading(null);
    setModal(null);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          배너 추가
        </button>
      </div>

      {/* 4열 카드 그리드 */}
      {banners.length > 0 ? (
        <div className="grid grid-cols-4 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* 이미지 */}
              <div className="relative bg-secondary" style={{ aspectRatio: "1 / 1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPublicImageUrl(b.image_url)}
                  alt={b.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* 정보 */}
              <div className="px-3 py-2">
                <p className="text-sm font-semibold truncate">{b.name}</p>
                <a
                  href={b.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary truncate block hover:underline"
                >
                  {b.link}
                </a>
              </div>
              {/* 버튼 */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => openEdit(b)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-primary hover:bg-blue-50 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  수정
                </button>
                <div className="w-px bg-gray-100" />
                <button
                  onClick={() => openDelete(b)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs text-eliminate hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          등록된 배너가 없습니다.
        </div>
      )}

      {/* 추가 모달 */}
      {modal === "add" && (
        <Modal title="배너 추가" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="배너 이름"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">링크</label>
              <input
                type="url"
                value={addLink}
                onChange={(e) => setAddLink(e.target.value)}
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
                className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors"
              >
                {addFile ? addFile.name : "클릭하여 이미지 선택"}
              </button>
              {addPreview && (
                <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={addPreview} alt="미리보기" className="h-40 w-full object-cover" />
                </div>
              )}
            </div>
            {addError && <p className="text-sm text-eliminate">{addError}</p>}
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={loading === "add"}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-colors"
              >
                {loading === "add" ? "업로드 중..." : "추가"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 수정 모달 */}
      {modal === "edit" && selected && (
        <Modal title="배너 수정" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">링크</label>
              <input
                type="url"
                value={editForm.link}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                className={inputClass}
              />
            </div>
            <p className="text-xs text-gray-400">이미지는 변경할 수 없습니다.</p>
            {editError && <p className="text-sm text-eliminate">{editError}</p>}
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                disabled={loading === "edit"}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-colors"
              >
                {loading === "edit" ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 삭제 확인 */}
      {modal === "delete" && selected && (
        <Modal title="배너 삭제" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{selected.name}</span> 배너를 삭제합니다.
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={loading === "delete"}
                className="rounded-lg bg-eliminate px-4 py-2 text-sm font-semibold text-white hover:bg-eliminate-light disabled:opacity-60 transition-colors"
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
