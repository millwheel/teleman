import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";
import { LINK_CATEGORIES } from "@/data/linkCategories";

export async function GET() {
  const [
    { data: allAds, error: e1 },
    { data: allLinks, error: e2 },
  ] = await Promise.all([
    supabase.from("ad").select("*"),
    supabase.from("link").select("*").order("likes", { ascending: false }),
  ]);

  if (e1 || e2) {
    return NextResponse.json({ message: "데이터 조회 실패" }, { status: 500 });
  }

  const mapped = (allAds ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    link: b.link,
    type: b.type as "long" | "short",
    public_url: getPublicImageUrl(b.image_path),
  }));

  const longBanners = mapped.filter((b) => b.type === "long");
  const shortBanners = mapped.filter((b) => b.type === "short");

  const links = (allLinks ?? []).map((b) => ({
    ...b,
    public_url: b.image_path ? getPublicImageUrl(b.image_path) : null,
  }));

  return NextResponse.json({
    longBanners,
    shortBanners,
    categories: LINK_CATEGORIES,
    links,
  });
}
