"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ScammerSearchBar from "@/components/ScammerSearchBar";
import Pagination from "@/components/Pagination";
import Modal from "@/components/modal/Modal";
import { PAGE_SIZE } from "@/data/constants";

interface Scammer {
  id: number;
  name: string | null;
  phone_number: string | null;
  bank_account: string | null;
  description: string | null;
}

interface SearchResult {
  items: Scammer[];
  totalCount: number;
}

function TableHeaders() {
  return (
    <thead className="bg-gray-50 text-gray-500">
      <tr>
        <th className="w-[15%] px-5 py-3 text-left font-medium">이름</th>
        <th className="w-[22%] px-5 py-3 text-left font-medium">전화번호</th>
        <th className="w-[25%] px-5 py-3 text-left font-medium">계좌번호</th>
        <th className="w-[38%] px-5 py-3 text-left font-medium">설명</th>
      </tr>
    </thead>
  );
}

function SearchingTbody() {
  return (
    <tbody className="divide-y divide-gray-100">
      <tr>
        <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
          검색 중...
        </td>
      </tr>
    </tbody>
  );
}

function SearchBarWithAuth() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") ?? "name") as "name" | "phone" | "account";
  const q = searchParams.get("q") ?? "";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  return <ScammerSearchBar isLoggedIn={isLoggedIn} defaultType={type} defaultQ={q} />;
}

// ResultCount, ResultTbody, ResultPagination을 하나로 합침
// → Suspense 경계를 <table> 바깥에 둬서 브라우저 HTML 교정 문제 해소
function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get("type") ?? "name") as "name" | "phone" | "account";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const [selected, setSelected] = useState<Scammer | null>(null);
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/scammer/search?type=${type}&q=${encodeURIComponent(q)}&page=${page}&limit=${PAGE_SIZE}`)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)
      .then((result: SearchResult | null) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, q, page]);

  if (!q) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full table-fixed text-sm">
          <TableHeaders />
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
                검색어를 입력하세요.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <>
      <p className="mb-3 text-sm text-gray-600">
        총{" "}
        <span className="font-semibold text-red-600">{totalCount.toLocaleString("ko-KR")}</span>
        건의 사기꾼 정보가 조회되었습니다.
      </p>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full table-fixed text-sm">
          <TableHeaders />
          {loading ? (
            <SearchingTbody />
          ) : (
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{item.name ?? "-"}</td>
                    <td className="px-5 py-3 text-gray-600">{item.phone_number ?? "-"}</td>
                    <td className="px-5 py-3 text-gray-600">{item.bank_account ?? "-"}</td>
                    <td className="max-w-xs truncate px-5 py-3 text-gray-600">{item.description ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {!loading && items.length > 0 && (
        <Pagination
          totalCount={totalCount}
          currentPage={page}
          pageSize={PAGE_SIZE}
          onPageChange={(newPage) =>
            router.push(`/scammer/result?type=${type}&q=${encodeURIComponent(q)}&page=${newPage}`)
          }
        />
      )}

      {selected && (
        <Modal title="사기꾼 상세 정보" onClose={() => setSelected(null)}>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="mb-1 font-medium text-gray-500">이름</dt>
              <dd className="text-foreground">{selected.name ?? "-"}</dd>
            </div>
            <div>
              <dt className="mb-1 font-medium text-gray-500">전화번호</dt>
              <dd className="text-foreground">{selected.phone_number ?? "-"}</dd>
            </div>
            <div>
              <dt className="mb-1 font-medium text-gray-500">계좌번호</dt>
              <dd className="text-foreground">{selected.bank_account ?? "-"}</dd>
            </div>
            <div>
              <dt className="mb-1 font-medium text-gray-500">설명</dt>
              <dd className="whitespace-pre-wrap break-words text-foreground">
                {selected.description ?? "-"}
              </dd>
            </div>
          </dl>
        </Modal>
      )}
    </>
  );
}

export default function ScammerResultPage() {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <Suspense fallback={<ScammerSearchBar isLoggedIn={false} defaultType="name" defaultQ="" />}>
        <SearchBarWithAuth />
      </Suspense>

      <div className="py-4">
        <Suspense
          fallback={
            <>
              <p className="mb-3 text-sm text-gray-600">
                총{" "}
                <span className="font-semibold text-red-600">0</span>
                건의 사기꾼 정보가 조회되었습니다.
              </p>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full table-fixed text-sm">
                  <TableHeaders />
                  <SearchingTbody />
                </table>
              </div>
            </>
          }
        >
          <ResultContent />
        </Suspense>
      </div>
    </div>
  );
}
