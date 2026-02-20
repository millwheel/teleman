import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  let query = supabase.from("text_banners").select("*").order("sort_order");
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error: dbError } = await query;
  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { category_id, name, link } = await request.json();

  if (!category_id || !name || !link) {
    return NextResponse.json({ message: "모든 항목을 입력하세요." }, { status: 400 });
  }

  // 카테고리당 최대 10개 제한
  const { count } = await supabase
    .from("text_banners")
    .select("*", { count: "exact", head: true })
    .eq("category_id", category_id);

  if ((count ?? 0) >= 10) {
    return NextResponse.json(
      { message: "카테고리당 최대 10개까지 등록할 수 있습니다." },
      { status: 400 }
    );
  }

  const { data: maxRow } = await supabase
    .from("text_banners")
    .select("sort_order")
    .eq("category_id", category_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error: dbError } = await supabase
    .from("text_banners")
    .insert({ category_id, name, link, sort_order, created_by: session.userId })
    .select()
    .single();

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
