import { headers } from "next/headers";
import type { AdBanner } from "@/data/type";
import AdManager from "../../../components/admin/AdManager";

export default async function AdPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const cookie = headersList.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/admin/ads`, {
    headers: { cookie },
  });
  const data = await res.json();
  const banners: AdBanner[] = Array.isArray(data) ? data : [];

  return <AdManager initialBanners={banners} />;
}
