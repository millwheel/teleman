import { headers } from "next/headers";
import Image from "next/image";

interface Banner {
  id: number;
  name: string;
  link: string;
  public_url: string;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function GuaranteePage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/banners/guarantee`);
  const allBanners: Banner[] = await res.json();
  const banners = shuffle(allBanners);

  return (
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
                  src={banner.public_url}
                  alt={banner.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0" />
              </a>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center bg-primary text-white text-sm font-medium"
                style={{ aspectRatio: "1 / 1" }}
              >
                [ 빈 배너 ]
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Static 이미지 */}
      <section className="w-full pt-4">
        <Image
            src="/images/guarantee-banner.jpg"
            alt="텔레맨 보증업체 배너"
            width={1920}
            height={400}
            className="w-full h-auto"
            priority
        />
      </section>
    </div>
  );
}
