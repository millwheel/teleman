import { headers } from "next/headers";
import type { GuaranteeBanner } from "@/data/type";
import GuaranteeManager from "../../../components/admin/GuaranteeManager";

export default async function GuaranteePage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const cookie = headersList.get("cookie") ?? "";
  const res = await fetch(`${proto}://${host}/api/admin/guarantees`, {
    headers: { cookie },
  });
  const data = await res.json();
  const banners: GuaranteeBanner[] = Array.isArray(data) ? data : [];

  return <GuaranteeManager initialBanners={banners} />;
}
