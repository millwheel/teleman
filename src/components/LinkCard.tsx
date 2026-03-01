import Image from "next/image";
import type { LinkItem } from "@/data/type";
import { RANK_COLORS } from "@/data/rank";
import RankBadge from "@/components/RankBadge";

export default function LinkCard({
  link,
  rank,
}: {
  link: LinkItem;
  rank: number;
}) {
  return (
    <a
      href={link.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 overflow-hidden bg-background"
    >
      <div className="relative p-6">
        {link.public_url ? (
          <Image
            src={link.public_url}
            alt={link.name}
            width={300}
            height={70}
            className="w-full h-[70px] object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-[70px] bg-gray-100" />
        )}

        <div className="absolute top-1 left-1">
          <RankBadge rank={rank} size={24} />
        </div>
      </div>

      <div className="px-2 py-2 flex items-center justify-between gap-1">
        <span className={`text-sm font-bold truncate ${RANK_COLORS[rank - 1]}`}>
          {link.name}
        </span>
        <span className="flex items-center gap-0.5 text-xs text-primary">
          <span className="text-red-400 text-lg">♥</span>
          {link.likes}
        </span>
      </div>
    </a>
  );
}
