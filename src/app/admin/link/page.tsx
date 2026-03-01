"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { LINK_CATEGORIES } from "@/data/linkCategories";

export default function LinkItemPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all(
      LINK_CATEGORIES.map((c) =>
        fetch(`/api/admin/links?categoryCode=${c.code}`)
          .then((r) => r.json())
          .then(
            (data) => [c.code, Array.isArray(data) ? data.length : 0] as const,
          ),
      ),
    ).then((results) => setCounts(Object.fromEntries(results)));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">링크모음 관리</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {LINK_CATEGORIES.map((cat) => (
          <Link
            key={cat.code}
            href={`/admin/link/${cat.code}`}
            className="flex items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-background px-4 py-6 shadow-sm hover:opacity-90 transition-opacity"
          >
            <span className="text-sm font-bold text-primary truncate">
              {cat.name}
            </span>
            <span className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-sm text-primary">
                {counts[cat.code] ?? "-"}개
              </span>
              <Settings className="h-4 w-4 text-primary" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
