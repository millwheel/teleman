"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  totalCount: number;
  currentPage: number;
  pageSize: number;
} & (
  | { onPageChange: (page: number) => void; buildHref?: never }
  | { buildHref: (page: number) => string; onPageChange?: never }
);

export default function Pagination({
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  buildHref,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const delta = 2;
  const rangeStart = Math.max(1, currentPage - delta);
  const rangeEnd = Math.min(totalPages, currentPage + delta);
  const pages = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, i) => rangeStart + i);

  const btnBase =
    "flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm transition-colors cursor-pointer";

  const NavItem = ({
    page,
    disabled,
    ariaCurrent,
    ariaLabel,
    className,
    children,
  }: {
    page: number;
    disabled?: boolean;
    ariaCurrent?: "page";
    ariaLabel?: string;
    className: string;
    children: React.ReactNode;
  }) => {
    if (disabled) {
      return (
        <span className={cn(btnBase, "text-gray-300 cursor-not-allowed")} aria-label={ariaLabel}>
          {children}
        </span>
      );
    }
    if (buildHref) {
      return (
        <Link href={buildHref(page)} className={cn(btnBase, className)} aria-current={ariaCurrent} aria-label={ariaLabel}>
          {children}
        </Link>
      );
    }
    return (
      <button onClick={() => onPageChange!(page)} className={cn(btnBase, className)} aria-current={ariaCurrent} aria-label={ariaLabel}>
        {children}
      </button>
    );
  };

  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <NavItem page={1} disabled={currentPage === 1} className="text-gray-600 hover:bg-gray-100" ariaLabel="첫 페이지">
        <ChevronsLeft className="h-4 w-4" />
      </NavItem>
      <NavItem page={currentPage - 1} disabled={currentPage === 1} className="text-gray-600 hover:bg-gray-100" ariaLabel="이전 페이지">
        <ChevronLeft className="h-4 w-4" />
      </NavItem>

      {rangeStart > 1 && (
        <span className={cn(btnBase, "text-gray-400 cursor-default")}>…</span>
      )}

      {pages.map((p) => (
        <NavItem
          key={p}
          page={p}
          ariaCurrent={p === currentPage ? "page" : undefined}
          className={p === currentPage ? "bg-primary text-white font-semibold" : "text-gray-600 hover:bg-gray-100"}
        >
          {p}
        </NavItem>
      ))}

      {rangeEnd < totalPages && (
        <span className={cn(btnBase, "text-gray-400 cursor-default")}>…</span>
      )}

      <NavItem page={currentPage + 1} disabled={currentPage === totalPages} className="text-gray-600 hover:bg-gray-100" ariaLabel="다음 페이지">
        <ChevronRight className="h-4 w-4" />
      </NavItem>
      <NavItem page={totalPages} disabled={currentPage === totalPages} className="text-gray-600 hover:bg-gray-100" ariaLabel="마지막 페이지">
        <ChevronsRight className="h-4 w-4" />
      </NavItem>
    </div>
  );
}
