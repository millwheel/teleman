"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ScammerSearchBar from "@/components/ScammerSearchBar";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 20;

interface Scammer {
  id: number;
  name: string | null;
  phone_number: string | null;
  bank_account: string | null;
  description: string | null;
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = (searchParams.get("type") ?? "name") as "name" | "phone" | "account";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const [items, setItems] = useState<Scammer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    if (!q) return;

    let cancelled = false;
    setLoading(true);

    fetch(`/api/scammer/search?type=${type}&q=${encodeURIComponent(q)}&page=${page}&limit=${PAGE_SIZE}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setItems(data?.items ?? []);
        setTotalCount(data?.totalCount ?? 0);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [type, q, page]);

  function handlePageChange(newPage: number) {
    router.push(`/scammer/result?type=${type}&q=${encodeURIComponent(q)}&page=${newPage}`);
  }

  return (
      <div className="mx-auto max-w-7xl px-4">
      <ScammerSearchBar isLoggedIn={isLoggedIn} defaultType={type} defaultQ={q} />


        <div className="py-8">
          {!loading && q && items.length > 0 && (
            <p className="mb-4 text-sm text-gray-500">
              총{" "}
              <span className="font-semibold text-foreground">
                {totalCount.toLocaleString()}
              </span>
              건
            </p>
          )}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="w-[15%] px-5 py-3 text-left font-medium">이름</th>
                  <th className="w-[22%] px-5 py-3 text-left font-medium">전화번호</th>
                  <th className="w-[25%] px-5 py-3 text-left font-medium">계좌번호</th>
                  <th className="w-[38%] px-5 py-3 text-left font-medium">설명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
                      검색 중...
                    </td>
                  </tr>
                ) : !q ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
                      검색어를 입력하세요.
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-foreground">{item.name ?? "-"}</td>
                      <td className="px-5 py-3 text-gray-600">{item.phone_number ?? "-"}</td>
                      <td className="px-5 py-3 text-gray-600">{item.bank_account ?? "-"}</td>
                      <td className="max-w-xs truncate px-5 py-3 text-gray-600">{item.description ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && q && items.length > 0 && (
            <Pagination
              totalCount={totalCount}
              currentPage={page}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          )}
        </div>

    </div>
  );
}

export default function ScammerResultPage() {
  return (
    <Suspense
      fallback={
        <div>
          <div className="bg-secondary py-10 h-[120px]" />
          <div className="mx-auto max-w-7xl px-4">
            <div className="py-8">
              <p className="py-16 text-center text-sm text-gray-400">로딩 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
