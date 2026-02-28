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

  const { data, error } = await supabase
    .from("link")
    .select("*")
    .eq("category_code", code)
    .order("likes", { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const links = (data ?? []).map((item) => ({
    ...item,
    public_url: item.image_path ? getPublicImageUrl(item.image_path) : null,
  }));

  return NextResponse.json({ links });
}
