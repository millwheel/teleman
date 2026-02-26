import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";

export async function GET() {
  const [
    { data: allCommonBanners, error: e1 },
    { data: categories, error: e2 },
    { data: allTextBanners, error: e3 },
  ] = await Promise.all([
    supabase.from("common_banner").select("*"),
    supabase.from("text_banner_categories").select("*").order("sort_order"),
    supabase.from("text_banners").select("*").order("sort_order"),
  ]);

  if (e1 || e2 || e3) {
    return NextResponse.json({ message: "데이터 조회 실패" }, { status: 500 });
  }

  const mapped = (allCommonBanners ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    link: b.link,
    type: b.type as "long" | "short",
    public_url: getPublicImageUrl(b.image_path),
  }));

  const longBanners = mapped.filter((b) => b.type === "long");
  const shortBanners = mapped.filter((b) => b.type === "short");

  return NextResponse.json({
    longBanners,
    shortBanners,
    categories: categories ?? [],
    textBanners: allTextBanners ?? [],
  });
}
