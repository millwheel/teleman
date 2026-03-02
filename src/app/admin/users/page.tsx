"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Pagination from "@/components/Pagination";
import { PAGE_SIZE } from "@/data/constants";

interface User {
  id: number;
  username: string;
  nickname: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [items, setItems] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/users?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotalCount(data.totalCount);
      }
      setLoading(false);
    }
    load();
  }, [page]);

  async function handleToggleActive(user: User) {
    const action = user.is_active ? "비활성화" : "복구";
    if (!confirm(`"${user.nickname}" 회원을 ${action}하시겠습니까?`)) return;

    setActionLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH" });
    setActionLoading(false);

    if (res.ok) {
      const updated: User = await res.json();
      setItems((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(`${action}되었습니다.`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.message ?? `${action} 중 오류가 발생했습니다.`);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`"${user.nickname}" 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    setActionLoading(true);
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setActionLoading(false);

    if (res.ok) {
      setItems((prev) => prev.filter((u) => u.id !== user.id));
      setTotalCount((prev) => prev - 1);
      showToast("삭제되었습니다.");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.message ?? "삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">회원 관리</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="w-[18%] px-5 py-3 text-left font-medium">아이디</th>
              <th className="w-[18%] px-5 py-3 text-left font-medium">닉네임</th>
              <th className="w-[12%] px-5 py-3 text-left font-medium">권한</th>
              <th className="w-[12%] px-5 py-3 text-left font-medium">상태</th>
              <th className="w-[18%] px-5 py-3 text-left font-medium">가입일</th>
              <th className="w-[22%] px-5 py-3 text-right font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                  등록된 회원이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-foreground">{user.username}</td>
                  <td className="px-5 py-3 text-gray-600">{user.nickname}</td>
                  <td className="px-5 py-3 text-gray-600">{user.role}</td>
                  <td className="px-5 py-3">
                    {user.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        활성
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        비활성
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={actionLoading}
                        className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                          user.is_active
                            ? "border-gray-200 text-gray-600 hover:border-eliminate hover:text-eliminate"
                            : "border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {user.is_active ? "비활성화" : "복구"}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-gray-800 px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
