import Link from "next/link";
import { LINK_CATEGORIES } from "@/data/linkCategories";

export default function LinkCategoryTabs({ currentCode }: { currentCode: string }) {
  return (
    <div className="grid grid-cols-6 border-t border-l border-gray-200 my-4">
      {LINK_CATEGORIES.map((cat) => (
        <Link
          key={cat.code}
          href={`/links/${cat.code}`}
          className={`text-center py-2.5 text-sm font-medium border-b border-r border-gray-200 transition-colors
            ${currentCode === cat.code
              ? "bg-primary text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
