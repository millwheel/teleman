import type { AdBanner } from "@/data/type";

export default function AdBannerGrid({ banners }: { banners: AdBanner[] }) {
  if (!Array.isArray(banners) || banners.length === 0) return null;

  return (
    <section className="py-4">
      <div className="grid grid-cols-4 gap-1">
        {banners.map((banner) => (
          <a
            key={`${banner.type}-${banner.id}`}
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative block w-full ${banner.type === "long" ? "col-span-2" : "col-span-1"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.public_url}
              alt={banner.name}
              className="w-full h-auto object-contain"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
