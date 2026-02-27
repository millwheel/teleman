import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";
import { LINK_CATEGORIES } from "@/data/linkCategories";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const cat = LINK_CATEGORIES.find((c) => c.code === code);
  if (!cat) return NextResponse.json({ message: "카테고리를 찾을 수 없습니다." }, { status: 404 });

  const categoryId = cat.sort_order + 1;

  const [
    { data: banners, error: e1 },
    { data: links, error: e2 },
  ] = await Promise.all([
    supabase.from("common_banner").select("*"),
    supabase.from("link").select("*").eq("category_id", categoryId).order("sort_order"),
  ]);

  if (e1 || e2) return NextResponse.json({ message: "데이터 조회 실패" }, { status: 500 });

  const bannersWithUrl = (banners ?? []).map((b) => ({
    ...b,
    public_url: getPublicImageUrl(b.image_url),
  }));

  return NextResponse.json({
    banners: bannersWithUrl,
    links: links ?? [],
  });
}
