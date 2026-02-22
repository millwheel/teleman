"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import Modal from "./Modal";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 20;

interface Scammer {
  id: number;
  name: string | null;
  phone_number: string | null;
  bank_account: string | null;
  description: string | null;
  created_at: string;
}

interface FormState {
  name: string;
  phone_number: string;
  bank_account: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone_number: "",
  bank_account: "",
  description: "",
};

export default function ScammerManager() {
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

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const fetchItems = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/scammer?page=${p}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setTotalCount(data.totalCount);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems(page);
  }, [fetchItems, page]);

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
    });
    setFormError("");
    setModal("edit");
  }

  async function handleDelete(item: Scammer) {
    const label = item.name ?? item.phone_number ?? item.bank_account ?? String(item.id);
    if (!confirm(`"${label}" 을(를) 삭제하시겠습니까?`)) return;

    setActionLoading(true);
    const res = await fetch(`/api/admin/scammer/${item.id}`, { method: "DELETE" });
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
    const res = await fetch(
      isAdd ? "/api/admin/scammer" : `/api/admin/scammer/${selected!.id}`,
      {
        method: isAdd ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
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
      console.error("[ScammerManager] 저장 실패", { status: res.status, body: data, form });
      setFormError(data.message ?? "저장 중 오류가 발생했습니다.");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

  return (
    <div>
      {/* 헤더 */}
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

      {/* 목록 */}
      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">이름</th>
                  <th className="px-5 py-3 text-left font-medium">전화번호</th>
                  <th className="px-5 py-3 text-left font-medium">계좌번호</th>
                  <th className="px-5 py-3 text-left font-medium">설명</th>
                  <th className="px-5 py-3 text-right font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                      등록된 항목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {item.name ?? "-"}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{item.phone_number ?? "-"}</td>
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
                            className="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3 w-3" />
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-eliminate hover:text-eliminate transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalCount={totalCount}
            currentPage={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}

      {/* 추가/수정 모달 */}
      {modal && (
        <Modal
          title={modal === "add" ? "사기꾼 등록" : "사기꾼 수정"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="이름"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">전화번호</label>
              <input
                type="text"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="01012345678"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">계좌번호</label>
              <input
                type="text"
                value={form.bank_account}
                onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                placeholder="계좌번호"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">설명</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="설명 (선택)"
                rows={3}
                className={inputCls + " resize-none"}
              />
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
                {actionLoading ? "저장 중..." : modal === "add" ? "등록" : "저장"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-800 px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
