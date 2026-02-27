import { headers } from "next/headers";
import type { CommonBanner } from "@/data/type";
import CommonBannerManager from "../../../components/admin/CommonBannerManager";

export default async function CommonBannerPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const cookie = headersList.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/admin/common-banners`, {
    headers: { cookie },
  });
  const data = await res.json();
  const banners: CommonBanner[] = Array.isArray(data) ? data : [];

  return <CommonBannerManager initialBanners={banners} />;
}
