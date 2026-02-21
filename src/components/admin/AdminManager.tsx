"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import Modal from "./Modal";

interface Admin {
  id: number;
  username: string;
  nickname: string;
  created_at: string;
}

interface AdminManagerProps {
  currentUserId: number;
}

export default function AdminManager({ currentUserId }: AdminManagerProps) {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Admin | null>(null);
  const [toast, setToast] = useState("");

  // 추가 폼
  const [addUsername, setAddUsername] = useState("");
  const [addNickname, setAddNickname] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");
  const [addError, setAddError] = useState("");

  // 수정 폼
  const [editNickname, setEditNickname] = useState("");
  const [editError, setEditError] = useState("");

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  const fetchAdmins = useCallback(async () => {
    const res = await fetch("/api/admin/admins");
    if (res.ok) setAdmins(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  function openAdd() {
    setAddUsername(""); setAddNickname(""); setAddPassword(""); setAddConfirmPassword(""); setAddError("");
    setModal("add");
  }

  function openEdit(admin: Admin) {
    setSelected(admin);
    setEditNickname(admin.nickname);
    setEditError("");
    setModal("edit");
  }

  async function handleDelete(admin: Admin) {
    if (admin.id === currentUserId) {
      showToast("자기 자신은 삭제할 수 없습니다.");
      return;
    }
    if (!confirm("관리자를 삭제하시겠습니까?")) return;

    setActionLoading(true);
    const res = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
    setActionLoading(false);

    if (res.ok) {
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      router.refresh();
    } else {
      const data = await res.json();
      showToast(data.message ?? "삭제 중 오류가 발생했습니다.");
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");

    if (addPassword !== addConfirmPassword) {
      setAddError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setActionLoading(true);

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: addUsername, nickname: addNickname, password: addPassword }),
    });

    setActionLoading(false);

    if (res.ok) {
      const newAdmin = await res.json();
      setAdmins((prev) => [...prev, newAdmin]);
      setModal(null);
      router.refresh();
    } else {
      const data = await res.json();
      setAddError(data.message ?? "생성 중 오류가 발생했습니다.");
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setEditError("");
    setActionLoading(true);

    const res = await fetch(`/api/admin/admins/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: editNickname }),
    });

    setActionLoading(false);

    if (res.ok) {
      const updated = await res.json();
      setAdmins((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setModal(null);
      router.refresh();
    } else {
      const data = await res.json();
      setEditError(data.message ?? "수정 중 오류가 발생했습니다.");
    }
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">관리자 관리</h1>
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left font-medium">아이디</th>
                <th className="px-5 py-3 text-left font-medium">닉네임</th>
                <th className="px-5 py-3 text-left font-medium">가입일</th>
                <th className="px-5 py-3 text-right font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-foreground font-medium">
                    {admin.username}
                    {admin.id === currentUserId && (
                      <span className="ml-2 text-xs text-gray-400">(나)</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{admin.nickname}</td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(admin.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(admin)}
                        className="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3 w-3" />
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-eliminate hover:text-eliminate transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 추가 모달 */}
      {modal === "add" && (
        <Modal title="관리자 추가" onClose={() => setModal(null)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">아이디</label>
              <input
                type="text"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">닉네임</label>
              <input
                type="text"
                value={addNickname}
                onChange={(e) => setAddNickname(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">비밀번호</label>
              <input
                type="password"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                placeholder="8자 이상"
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">비밀번호 확인</label>
              <input
                type="password"
                value={addConfirmPassword}
                onChange={(e) => setAddConfirmPassword(e.target.value)}
                placeholder="비밀번호 확인"
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            {addError && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-eliminate">{addError}</p>
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
                {actionLoading ? "생성 중..." : "생성"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 수정 모달 */}
      {modal === "edit" && selected && (
        <Modal title="관리자 수정" onClose={() => setModal(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">아이디</label>
              <input
                type="text"
                value={selected.username}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">닉네임</label>
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            {editError && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-eliminate">{editError}</p>
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
                {actionLoading ? "저장 중..." : "저장"}
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
