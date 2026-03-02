"use client";

import Link from "next/link";
import { COMMUNITY_CATEGORIES } from "@/data/communityCategories";
import { cn } from "@/lib/utils";

type CategoryTabsProps = {
  current: string;
};

export default function CategoryTabs({ current }: CategoryTabsProps) {
  return (
    <div className="flex gap-1 mb-6 border-b border-gray-300 bg-background">
      {COMMUNITY_CATEGORIES.map((cat) => (
        <Link
          key={cat.key}
          href={`/community/${cat.key}`}
          className={cn(
            "px-5 py-3 text-sm font-medium -mb-px border-b-2 transition-colors",
            current === cat.key
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700",
          )}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}
