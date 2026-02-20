"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Modal from "./Modal";

interface Category {
  id: number;
  name: string;
}

interface TextBanner {
  id: number;
  name: string;
  link: string;
  sort_order: number;
  category_id: number;
}

interface Props {
  category: Category;
  banners: TextBanner[];
}

interface FormState {
  name: string;
  link: string;
}

export default function TextBannerDetail({ category, banners }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | string | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<TextBanner | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", link: "" });
  const [formError, setFormError] = useState("");

  function openAdd() {
    setForm({ name: "", link: "" });
    setFormError("");
    setModal("add");
  }

  function openEdit(b: TextBanner) {
    setSelected(b);
    setForm({ name: b.name, link: b.link });
    setFormError("");
    setModal("edit");
  }

  function openDelete(b: TextBanner) {
    setSelected(b);
    setModal("delete");
  }

  async function handleReorder(id: number, direction: "up" | "down") {
    setLoading(`reorder-${id}`);
    await fetch(`/api/admin/text-banners/${id}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    setLoading(null);
    router.refresh();
  }

  async function handleAdd() {
    setFormError("");
    if (!form.name || !form.link) {
      setFormError("이름과 링크를 입력하세요.");
      return;
    }
    setLoading("add");
    const res = await fetch("/api/admin/text-banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category_id: category.id, name: form.name, link: form.link }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) { setFormError(data.message); return; }
    setModal(null);
    router.refresh();
  }

  async function handleEdit() {
    if (!selected) return;
    setFormError("");
    if (!form.name || !form.link) {
      setFormError("이름과 링크를 입력하세요.");
      return;
    }
    setLoading("edit");
    const res = await fetch(`/api/admin/text-banners/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, link: form.link }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) { setFormError(data.message); return; }
    setModal(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!selected) return;
    setLoading("delete");
    await fetch(`/api/admin/text-banners/${selected.id}`, { method: "DELETE" });
    setLoading(null);
    setModal(null);
    router.refresh();
  }

  const atLimit = banners.length >= 10;

  return (
    <div>
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/text-banner"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            링크모음 관리
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{category.name}</h1>
          <span className="text-sm text-gray-400">({banners.length}/10)</span>
        </div>
        <button
          onClick={openAdd}
          disabled={atLimit}
          title={atLimit ? "최대 10개까지 등록 가능합니다." : ""}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
          배너 추가
        </button>
      </div>

      {atLimit && (
        <p className="mb-4 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          최대 10개 한도에 도달했습니다. 기존 항목을 삭제 후 추가할 수 있습니다.
        </p>
      )}

      {/* 배너 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">순서</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">이름</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">링크</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banners.map((b, idx) => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 max-w-xs">
                  <a
                    href={b.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate block text-[var(--primary)] hover:underline text-xs"
                  >
                    {b.link}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleReorder(b.id, "up")}
                      disabled={idx === 0 || loading !== null}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReorder(b.id, "down")}
                      disabled={idx === banners.length - 1 || loading !== null}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded hover:bg-blue-50 text-[var(--primary)] transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDelete(b)}
                      className="p-1.5 rounded hover:bg-red-50 text-[var(--eliminate)] transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  등록된 배너가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 추가 모달 */}
      {modal === "add" && (
        <Modal title="배너 추가" onClose={() => setModal(null)}>
          <BannerForm
            form={form}
            onChange={setForm}
            error={formError}
            onSubmit={handleAdd}
            onCancel={() => setModal(null)}
            loading={loading === "add"}
            submitLabel="추가"
          />
        </Modal>
      )}

      {/* 수정 모달 */}
      {modal === "edit" && selected && (
        <Modal title="배너 수정" onClose={() => setModal(null)}>
          <BannerForm
            form={form}
            onChange={setForm}
            error={formError}
            onSubmit={handleEdit}
            onCancel={() => setModal(null)}
            loading={loading === "edit"}
            submitLabel="저장"
          />
        </Modal>
      )}

      {/* 삭제 확인 */}
      {modal === "delete" && selected && (
        <Modal title="배너 삭제" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-[var(--foreground)]">{selected.name}</span>{" "}
              배너를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
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
                className="rounded-lg bg-[var(--eliminate)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--eliminate-light)] disabled:opacity-60 transition-colors"
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

function BannerForm({
  form,
  onChange,
  error,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
  error: string;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="배너 표시 이름"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">링크</label>
        <input
          type="url"
          value={form.link}
          onChange={(e) => onChange({ ...form, link: e.target.value })}
          placeholder="https://t.me/..."
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-[var(--eliminate)]">{error}</p>}
      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-light)] disabled:opacity-60 transition-colors"
        >
          {loading ? "처리 중..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
