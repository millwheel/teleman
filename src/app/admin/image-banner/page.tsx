import { headers } from "next/headers";
import type { GuaranteeBanner } from "@/data/type";
import ImageBannerClient from "./ImageBannerClient";

export default async function ImageBannerPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/admin/image-banners`);
  const banners: GuaranteeBanner[] = await res.json();

  return <ImageBannerClient initialBanners={banners} />;
}
