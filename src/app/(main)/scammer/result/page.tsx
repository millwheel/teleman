"use client";

import { use, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ScammerSearchBar from "@/components/ScammerSearchBar";
import Pagination from "@/components/Pagination";
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

// 동일한 params → 동일한 Promise 반환 → 중복 fetch 없음
const searchCache = new Map<string, Promise<SearchResult | null>>();

function fetchSearch(type: string, q: string, page: number): Promise<SearchResult | null> {
  const key = `${type}:${q}:${page}`;
  if (!searchCache.has(key)) {
    searchCache.set(
      key,
      fetch(`/api/scammer/search?type=${type}&q=${encodeURIComponent(q)}&page=${page}&limit=${PAGE_SIZE}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    );
  }
  return searchCache.get(key)!;
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

  const data = use(fetchSearch(type, q, page));
  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <>
      {items.length > 0 && (
        <div className="mb-4 bg-warning py-4 rounded-lg">
          <p className="text-base text-gray-500 text-center">
            총{" "}
            <span className="font-semibold text-foreground">{totalCount.toLocaleString("ko-KR")}</span>
            건의 사기꾼이 검색되었습니다.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full table-fixed text-sm">
          <TableHeaders />
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
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

      {items.length > 0 && (
        <Pagination
          totalCount={totalCount}
          currentPage={page}
          pageSize={PAGE_SIZE}
          onPageChange={(newPage) =>
            router.push(`/scammer/result?type=${type}&q=${encodeURIComponent(q)}&page=${newPage}`)
          }
        />
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
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full table-fixed text-sm">
                <TableHeaders />
                <SearchingTbody />
              </table>
            </div>
          }
        >
          <ResultContent />
        </Suspense>
      </div>
    </div>
  );
}
