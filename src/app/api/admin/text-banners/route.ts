import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { LINK_CATEGORIES } from "@/data/linkCategories";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const categoryCode = searchParams.get("categoryCode");

  let query = supabase.from("link").select("*").order("sort_order");
  if (categoryCode) {
    const cat = LINK_CATEGORIES.find((c) => c.code === categoryCode);
    if (cat) query = query.eq("category_id", cat.sort_order + 1);
  }

  const { data, error: dbError } = await query;
  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { category_code, name, link } = await request.json();

  const cat = LINK_CATEGORIES.find((c) => c.code === category_code);
  if (!cat || !name || !link) {
    return NextResponse.json({ message: "모든 항목을 입력하세요." }, { status: 400 });
  }

  const category_id = cat.sort_order + 1;

  // 카테고리당 최대 10개 제한
  const { count } = await supabase
    .from("link")
    .select("*", { count: "exact", head: true })
    .eq("category_id", category_id);

  if ((count ?? 0) >= 10) {
    return NextResponse.json(
      { message: "카테고리당 최대 10개까지 등록할 수 있습니다." },
      { status: 400 }
    );
  }

  const { data: maxRow } = await supabase
    .from("link")
    .select("sort_order")
    .eq("category_id", category_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error: dbError } = await supabase
    .from("link")
    .insert({ category_id, name, link, sort_order, created_by: session.userId })
    .select()
    .single();

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
