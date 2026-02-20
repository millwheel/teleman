"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import Modal from "./Modal";

interface Category {
  id: number;
  code: string;
  name: string;
  sort_order: number;
}

interface Props {
  categories: Category[];
}

interface FormState {
  code: string;
  name: string;
}

export default function CategoryManager({ categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | string | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>({ code: "", name: "" });
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const isValidCode = (code: string) => /^[a-z0-9]+$/.test(code);

  function openAdd() {
    setForm({ code: "", name: "" });
    setFormError("");
    setModal("add");
  }

  function openEdit(cat: Category) {
    setSelected(cat);
    setForm({ code: cat.code, name: cat.name });
    setFormError("");
    setModal("edit");
  }

  function openDelete(cat: Category) {
    setSelected(cat);
    setDeleteError("");
    setModal("delete");
  }

  async function handleReorder(id: number, direction: "up" | "down") {
    setLoading(`reorder-${id}-${direction}`);
    await fetch(`/api/admin/text-banner-categories/${id}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    setLoading(null);
    router.refresh();
  }

  async function handleAdd() {
    setFormError("");
    if (!isValidCode(form.code)) {
      setFormError("code는 영문 소문자와 숫자만 허용됩니다.");
      return;
    }
    if (!form.name) {
      setFormError("이름을 입력하세요.");
      return;
    }
    setLoading("add");
    const res = await fetch("/api/admin/text-banner-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    if (!isValidCode(form.code)) {
      setFormError("code는 영문 소문자와 숫자만 허용됩니다.");
      return;
    }
    if (!form.name) {
      setFormError("이름을 입력하세요.");
      return;
    }
    setLoading("edit");
    const res = await fetch(`/api/admin/text-banner-categories/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) { setFormError(data.message); return; }
    setModal(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleteError("");
    setLoading("delete");
    const res = await fetch(`/api/admin/text-banner-categories/${selected.id}`, {
      method: "DELETE",
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json();
      setDeleteError(data.message);
      return;
    }
    setModal(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">링크 카테고리 관리</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 transition-colors"
        >
          <Plus className="h-4 w-4" />
          카테고리 추가
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-600 w-12">순서</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">카테고리명</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat, idx) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                <td className="px-4 py-3 font-mono text-primary">{cat.code}</td>
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleReorder(cat.id, "up")}
                      disabled={idx === 0 || loading !== null}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleReorder(cat.id, "down")}
                      disabled={idx === categories.length - 1 || loading !== null}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded hover:bg-blue-50 text-primary transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDelete(cat)}
                      className="p-1.5 rounded hover:bg-red-50 text-eliminate transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  등록된 카테고리가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 추가 모달 */}
      {modal === "add" && (
        <Modal title="카테고리 추가" onClose={() => setModal(null)}>
          <CategoryForm
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
        <Modal title="카테고리 수정" onClose={() => setModal(null)}>
          <CategoryForm
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

      {/* 삭제 확인 AlertDialog */}
      {modal === "delete" && selected && (
        <Modal title="카테고리 삭제" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm font-semibold text-eliminate mb-1">
                ⚠️ 주의
              </p>
              <p className="text-sm text-gray-700">
                하위에 링크모음이 모두 삭제됩니다. 정말로 삭제합니까?
              </p>
              <p className="text-sm font-medium text-gray-800 mt-2">
                대상: <span className="text-primary">{selected.name}</span>{" "}
                (<span className="font-mono">{selected.code}</span>)
              </p>
            </div>
            {deleteError && (
              <p className="text-sm text-eliminate">{deleteError}</p>
            )}
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

function CategoryForm({
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
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Code <span className="text-xs text-gray-400">(영문 소문자 + 숫자)</span>
        </label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => onChange({ ...form, code: e.target.value })}
          placeholder="예: promotion"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">카테고리명</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="예: 텔레그램 홍보방 TOP 10"
          className={inputClass}
        />
      </div>
      {error && <p className="text-sm text-eliminate">{error}</p>}
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
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-colors"
        >
          {loading ? "처리 중..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
