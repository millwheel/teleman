"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import Modal from "@/components/modal/Modal";
import Pagination from "@/components/Pagination";
import { PAGE_SIZE } from "@/data/constants";
import { Scammer } from "@/data/type";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from "@/util/file";

interface FormState {
  name: string;
  phone_number: string;
  bank_account: string;
  description: string;
  imageFile: File | null;
  previewUrl: string | null;
  existingPublicUrl: string | null;
  removeImage: boolean;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone_number: "",
  bank_account: "",
  description: "",
  imageFile: null,
  previewUrl: null,
  existingPublicUrl: null,
  removeImage: false,
};

export default function AdminScammerPage() {
  const router = useRouter();
  const [items, setItems] = useState<Scammer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Scammer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function fetchItems(p: number) {
    setLoading(true);
    const res = await fetch(`/api/admin/scammer?page=${p}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setTotalCount(data.totalCount);
    }
    setLoading(false);
  }

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/scammer?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotalCount(data.totalCount);
      }
      setLoading(false);
    }
    load();
  }, [page]);

  // 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    };
  }, [form.previewUrl]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModal("add");
  }

  function openEdit(item: Scammer) {
    setSelected(item);
    setForm({
      name: item.name ?? "",
      phone_number: item.phone_number ?? "",
      bank_account: item.bank_account ?? "",
      description: item.description ?? "",
      imageFile: null,
      previewUrl: null,
      existingPublicUrl: item.public_url,
      removeImage: false,
    });
    setFormError("");
    setModal("edit");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setFormError(`파일 크기가 ${MAX_FILE_SIZE_LABEL}를 초과합니다.`);
      e.target.value = "";
      return;
    }

    if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      previewUrl: URL.createObjectURL(file),
      removeImage: false,
    }));
    setFormError("");
  }

  function handleRemoveImage() {
    if (form.previewUrl) URL.revokeObjectURL(form.previewUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setForm((prev) => ({
      ...prev,
      imageFile: null,
      previewUrl: null,
      removeImage: prev.existingPublicUrl !== null,
    }));
  }

  async function handleDelete(item: Scammer) {
    const label =
      item.name ?? item.phone_number ?? item.bank_account ?? String(item.id);
    if (!confirm(`"${label}" 을(를) 삭제하시겠습니까?`)) return;

    setActionLoading(true);
    const res = await fetch(`/api/admin/scammer/${item.id}`, {
      method: "DELETE",
    });
    setActionLoading(false);

    if (res.ok) {
      setItems((prev) => prev.filter((s) => s.id !== item.id));
      setTotalCount((prev) => prev - 1);
      showToast("삭제되었습니다.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.message ?? "삭제 중 오류가 발생했습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);

    const isAdd = modal === "add";
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("phone_number", form.phone_number);
    fd.append("bank_account", form.bank_account);
    fd.append("description", form.description);
    if (form.imageFile) fd.append("image", form.imageFile);
    if (form.removeImage) fd.append("removeImage", "true");

    const res = await fetch(
      isAdd ? "/api/admin/scammer" : `/api/admin/scammer/${selected!.id}`,
      {
        method: isAdd ? "POST" : "PATCH",
        body: fd,
      },
    );

    setActionLoading(false);

    if (res.ok || res.status === 201) {
      const saved: Scammer = await res.json();
      if (isAdd) {
        fetchItems(page);
      } else {
        setItems((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
      }
      setModal(null);
      showToast(isAdd ? "등록되었습니다." : "수정되었습니다.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      console.error("[AdminScammerPage] 저장 실패", {
        status: res.status,
        body: data,
        form,
      });
      setFormError(data.message ?? "저장 중 오류가 발생했습니다.");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

  // 현재 미리보기로 보여줄 이미지 (새 파일 > 기존 이미지 > 없음)
  const currentImageUrl = form.previewUrl
    ?? (form.removeImage ? null : form.existingPublicUrl);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">사기꾼 관리</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          추가
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="w-[15%] px-5 py-3 text-left font-medium">이름</th>
              <th className="w-[20%] px-5 py-3 text-left font-medium">
                전화번호
              </th>
              <th className="w-[20%] px-5 py-3 text-left font-medium">
                계좌번호
              </th>
              <th className="w-[35%] px-5 py-3 text-left font-medium">설명</th>
              <th className="w-[10%] px-5 py-3 text-right font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm text-gray-400"
                >
                  불러오는 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-gray-400"
                >
                  등록된 항목이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3 font-medium text-foreground">
                    {item.name ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {item.phone_number ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {item.bank_account ?? "-"}
                  </td>
                  <td className="max-w-xs truncate px-5 py-3 text-gray-600">
                    {item.description ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        title="수정"
                        className="rounded border border-gray-200 p-1.5 text-gray-600 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={actionLoading}
                        title="삭제"
                        className="rounded border border-gray-200 p-1.5 text-gray-600 hover:border-eliminate hover:text-eliminate transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && (
        <Pagination
          totalCount={totalCount}
          currentPage={page}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => { setLoading(true); setPage(p); }}
        />
      )}

      {modal && (
        <Modal
          title={modal === "add" ? "사기꾼 등록" : "사기꾼 수정"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="이름"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                전화번호
              </label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) =>
                  setForm({ ...form, phone_number: e.target.value })
                }
                placeholder="01012345678"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                계좌번호
              </label>
              <input
                type="text"
                value={form.bank_account}
                onChange={(e) =>
                  setForm({ ...form, bank_account: e.target.value })
                }
                placeholder="계좌번호"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                설명
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="설명 (선택)"
                rows={3}
                className={inputCls + " resize-none"}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                이미지 (선택)
              </label>
              {currentImageUrl ? (
                <div className="relative inline-block">
                  <Image
                    src={currentImageUrl}
                    alt="미리보기"
                    width={400}
                    height={300}
                    className="h-40 w-auto rounded-lg border border-gray-200 object-contain"
                    unoptimized={currentImageUrl.startsWith("blob:")}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="이미지 제거"
                    className="absolute -top-2 -right-2 rounded-full bg-white border border-gray-300 p-1 text-gray-600 shadow-sm hover:border-eliminate hover:text-eliminate transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`${currentImageUrl ? "mt-2" : ""} block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:opacity-80`}
              />
              <p className="mt-1 text-xs text-gray-400">
                최대 {MAX_FILE_SIZE_LABEL}
              </p>
            </div>
            <p className="text-xs text-gray-400">
              * 이름, 전화번호, 계좌번호 중 최소 하나는 입력해야 합니다.
            </p>
            {formError && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-eliminate">
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-opacity cursor-pointer"
              >
                {actionLoading
                  ? "저장 중..."
                  : modal === "add"
                    ? "등록"
                    : "저장"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-800 px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
