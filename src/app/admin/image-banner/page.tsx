import { headers } from "next/headers";
import type { GuaranteeBanner } from "@/data/type";
import ImageBannerManager from "../../../components/admin/ImageBannerManager";

export default async function ImageBannerPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const cookie = headersList.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/admin/image-banners`, {
    headers: { cookie },
  });
  const data = await res.json();
  const banners: GuaranteeBanner[] = Array.isArray(data) ? data : [];

  return <ImageBannerManager initialBanners={banners} />;
}
