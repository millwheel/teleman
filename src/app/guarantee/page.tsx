import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";
import Image from "next/image";

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function GuaranteePage() {
  const { data: allBanners } = await supabase
    .from("image_banner")
    .select("*");

  const banners = shuffle(allBanners ?? []);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4">
      {/* 이미지 배너 4열 그리드 */}
      <section className="py-4">
        {banners.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {banners.map((banner) => (
              <a
                key={banner.id}
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden border border-secondary bg-primary"
                style={{ aspectRatio: "1 / 1" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPublicImageUrl(banner.image_url)}
                  alt={banner.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                {/* hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              </a>
            ))}
          </div>
        ) : (
          /* 데이터 없을 때 placeholder 그리드 */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center bg-primary text-white text-sm font-medium"
                style={{ aspectRatio: "1 / 1" }}
              >
                [ 배너 ]
              </div>
            ))}
          </div>
        )}
      </section>
      </div>

      {/* 하단 보증 이미지 */}
      <div className="mx-auto max-w-7xl px-4 mt-4">
        <Image
          src="/images/guarantee-bottom.jpg"
          alt="텔레맨 보증업체"
          className="w-full"
          width={400}
          height={300}
        />
      </div>
    </div>
  );
}
