"use client";

import { use, useState, useEffect, Suspense } from "react";
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
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return <ScammerSearchBar isLoggedIn={isLoggedIn} defaultType={type} defaultQ={q} />;
}

function ResultTbody() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") ?? "name") as "name" | "phone" | "account";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  if (!q) {
    return (
      <tbody className="divide-y divide-gray-100">
        <tr>
          <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
            검색어를 입력하세요.
          </td>
        </tr>
      </tbody>
    );
  }

  const data = use(fetchSearch(type, q, page));
  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <tbody className="divide-y divide-gray-100">
        <tr>
          <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
            검색 결과가 없습니다.
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-gray-100">
      {items.map((item) => (
        <tr key={item.id} className="transition-colors hover:bg-gray-50">
          <td className="px-5 py-3 font-medium text-foreground">{item.name ?? "-"}</td>
          <td className="px-5 py-3 text-gray-600">{item.phone_number ?? "-"}</td>
          <td className="px-5 py-3 text-gray-600">{item.bank_account ?? "-"}</td>
          <td className="max-w-xs truncate px-5 py-3 text-gray-600">{item.description ?? "-"}</td>
        </tr>
      ))}
    </tbody>
  );
}

// fetchSearch(type, q, page) → searchCache 히트 → 동일 Promise → 추가 fetch 없음
function ResultCount() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") ?? "name") as "name" | "phone" | "account";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  if (!q) return null;

  const data = use(fetchSearch(type, q, page));
  const totalCount = data?.totalCount ?? 0;
  if (!data?.items?.length) return null;

  return (
    <div className="mt-8 bg-warning py-4">
      <p className="text-base text-gray-500 text-center">
        총{" "}
        <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span>
        건의 사기꾼이 검색되었습니다.
      </p>
    </div>
  );
}

function ResultPagination() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get("type") ?? "name") as "name" | "phone" | "account";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  if (!q) return null;

  const data = use(fetchSearch(type, q, page));
  const totalCount = data?.totalCount ?? 0;
  if (!data?.items?.length) return null;

  function handlePageChange(newPage: number) {
    router.push(`/scammer/result?type=${type}&q=${encodeURIComponent(q)}&page=${newPage}`);
  }

  return (
    <Pagination
      totalCount={totalCount}
      currentPage={page}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
    />
  );
}

export default function ScammerResultPage() {
  return (
    <div className="mx-auto max-w-7xl px-4">
      <Suspense fallback={<ScammerSearchBar isLoggedIn={false} defaultType="name" defaultQ="" />}>
        <SearchBarWithAuth />
      </Suspense>

      <Suspense fallback={null}>
        <ResultCount />
      </Suspense>

      <div className="py-4">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* table은 항상 렌더링 — Suspense는 tbody만 교체 */}
          <table className="w-full table-fixed text-sm">
            <TableHeaders />
            <Suspense fallback={<SearchingTbody />}>
              <ResultTbody />
            </Suspense>
          </table>
        </div>

        <Suspense fallback={null}>
          <ResultPagination />
        </Suspense>
      </div>
    </div>
  );
}
