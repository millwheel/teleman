"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ScammerSearchSection from "@/components/ScammerSearchSection";
import ScammerResultTable from "@/components/ScammerResultTable";

const PAGE_SIZE = 20;

interface Scammer {
  id: number;
  name: string | null;
  phone_number: string | null;
  bank_account: string | null;
  description: string | null;
}

function ResultContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = (searchParams.get("type") ?? "name") as "name" | "phone" | "account";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const [items, setItems] = useState<Scammer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!q) {
      setFetched(true);
      return;
    }
    setLoading(true);
    const res = await fetch(
      `/api/scammer/search?type=${type}&q=${encodeURIComponent(q)}&page=${page}&limit=${PAGE_SIZE}`
    );
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setTotalCount(data.totalCount);
    }
    setLoading(false);
    setFetched(true);
  }, [type, q, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function handlePageChange(newPage: number) {
    router.push(
      `/scammer/result?type=${type}&q=${encodeURIComponent(q)}&page=${newPage}`
    );
  }

  return (
    <>
      <ScammerSearchSection isLoggedIn={isLoggedIn} type={type} q={q} />
      <ScammerResultTable
        items={items}
        totalCount={totalCount}
        loading={loading}
        fetched={fetched}
        currentPage={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </>
  );
}

export default function ScammerResultList({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <Suspense
      fallback={
        <>
          <div className="bg-secondary py-10 h-32" />
          <div className="mx-auto max-w-7xl px-4 py-8">
            <p className="py-16 text-center text-sm text-gray-400">로딩 중...</p>
          </div>
        </>
      }
    >
      <ResultContent isLoggedIn={isLoggedIn} />
    </Suspense>
  );
}
