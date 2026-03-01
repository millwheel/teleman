import { MEDALS, RANK_COLORS } from "@/data/rank";
import { LinkCategory, LinkItem } from "@/data/type";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  category: LinkCategory;
  items: LinkItem[];
};

export default function LinkCategoryCard({ category, items }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <Link
        href={`/link/${category.code}`}
        className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        {category.icon && (
          <span className="text-xl shrink-0">{category.icon}</span>
        )}
        <span className="flex-1 text-sm font-bold text-gray-900 truncate">
          {category.name} Top10
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
      </Link>

      <ul>
        {Array.from({ length: 10 }, (_, idx) => {
          const item = items[idx];
          return item ? (
            <li key={item.id}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                {idx < 3 ? (
                  <span className="text-lg leading-none shrink-0">
                    {MEDALS[idx]}
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-orange-400 text-orange-400 text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                )}
                <span
                  className={`text-sm font-medium truncate ${RANK_COLORS[idx]}`}
                >
                  {item.name}
                </span>
              </a>
            </li>
          ) : (
            <li
              key={`empty-${idx}`}
              className="flex items-center gap-3 px-4 py-2"
            >
              <span className="w-5 shrink-0" />
              <span className="text-sm text-gray-300">빈 칸</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
