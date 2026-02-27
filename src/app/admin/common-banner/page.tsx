import { headers } from "next/headers";
import type { CommonBanner } from "@/data/type";
import CommonBannerClient from "./CommonBannerClient";

export default async function CommonBannerPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/admin/common-banners`);
  const banners: CommonBanner[] = await res.json();

  return <CommonBannerClient initialBanners={banners} />;
}
