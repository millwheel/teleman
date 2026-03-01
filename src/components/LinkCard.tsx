import type { LinkItem } from "@/data/type";
import { MEDALS } from "@/data/rank";

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
      className="block rounded-lg border border-gray-200 overflow-hidden bg-background"
    >
      <div className="relative p-5">
        {link.public_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.public_url}
            alt={link.name}
            className="w-full object-cover rounded-md"
            style={{ height: "70px" }}
          />
        ) : (
          <div
            className="w-full bg-gray-100 rounded-md"
            style={{ height: "70px" }}
          />
        )}

        <div className="absolute top-1 left-1">
          {rank <= 3 ? (
            <span className="text-2xl leading-none">{MEDALS[rank - 1]}</span>
          ) : (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700/80 text-white text-xs font-bold">
              {rank}
            </span>
          )}
        </div>
      </div>

      <div className="px-2 py-2 flex items-center justify-between gap-1">
        <span
          className={`text-sm font-bold truncate ${rank <= 3 ? "text-primary" : "text-gray-800"}`}
        >
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
