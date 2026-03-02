import type { AdBanner } from "@/data/type";

export default function AdBannerGrid({ banners }: { banners: AdBanner[] }) {
  if (!Array.isArray(banners) || banners.length === 0) return null;

  return (
    <section className="py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        {banners.map((banner) => (
          <a
            key={`${banner.type}-${banner.id}`}
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`relative block overflow-hidden w-full ${banner.type === "long" ? "col-span-2" : "col-span-1"}`}
            style={{ height: "104px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.public_url}
              alt={banner.name}
              className="h-full w-full object-cover"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
