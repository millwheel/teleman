"use client";

import { Suspense, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type SearchType = "name" | "phone" | "account";

const SEARCH_TYPES: { value: SearchType; label: string; minLength: number; placeholder: string }[] = [
  { value: "name",    label: "이름",    minLength: 2, placeholder: "이름을 입력하세요 (2자 이상)" },
  { value: "phone",   label: "전화번호", minLength: 4, placeholder: "전화번호를 입력하세요 (4자 이상)" },
  { value: "account", label: "계좌번호", minLength: 4, placeholder: "계좌번호를 입력하세요 (4자 이상)" },
];

export interface ScammerSearchBarProps {
  isLoggedIn: boolean;
  defaultType?: SearchType;
  defaultQ?: string;
}

function SearchBarContent({
  isLoggedIn,
  defaultType = "name",
  defaultQ = "",
}: ScammerSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [type, setType] = useState<SearchType>(defaultType);
  const [query, setQuery] = useState(defaultQ);

  const currentType = SEARCH_TYPES.find((t) => t.value === type)!;

  function handleSearch() {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다.");
      const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < currentType.minLength) {
      alert(`${currentType.label}은(는) ${currentType.minLength}자 이상 입력해주세요.`);
      return;
    }

    router.push(`/scammer/result?type=${type}&q=${encodeURIComponent(trimmed)}&page=1`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <section className="bg-secondary py-10 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">사기꾼 조회</h1>
        <p className="text-sm text-white/80">한눈에 확인되는, 믿을 수 있는 검증조건</p>
        <div className="flex w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
          {/* 검색 타입 드롭다운 */}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as SearchType);
              setQuery("");
            }}
            className="border-r border-gray-200 bg-white px-3 py-3 text-sm font-medium text-primary outline-none cursor-pointer shrink-0"
          >
            {SEARCH_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* 검색어 입력 */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentType.placeholder}
            className="flex-1 min-w-0 px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />

          <button
            onClick={handleSearch}
            className="flex items-center justify-center bg-primary px-5 py-3 text-white transition-opacity hover:opacity-80 cursor-pointer shrink-0"
            aria-label="검색"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>
        </div>
        <p className="text-sm text-white/80">
          텔레맨은 고객의 안전을 위해 자체 검증 시스템을 활용하여 실시간 검증 시스템으로
          누구보다 정확한 정보와 안정적인 서비스를 제공합니다.
        </p>
      </div>
    </section>
  );
}

export default function ScammerSearchBar(props: ScammerSearchBarProps) {
  return (
    <Suspense fallback={<div className="bg-secondary py-10 h-[120px]" />}>
      <SearchBarContent {...props} />
    </Suspense>
  );
}
