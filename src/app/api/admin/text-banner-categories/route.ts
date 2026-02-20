import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("text_banner_categories")
    .select("*")
    .order("sort_order");

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { code, name } = await request.json();

  if (!code || !name) {
    return NextResponse.json({ message: "code와 name을 입력하세요." }, { status: 400 });
  }
  if (!/^[a-z0-9]+$/.test(code)) {
    return NextResponse.json({ message: "code는 영문 소문자와 숫자만 허용됩니다." }, { status: 400 });
  }

  const { data: maxRow } = await supabase
    .from("text_banner_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error: dbError } = await supabase
    .from("text_banner_categories")
    .insert({ code, name, sort_order })
    .select()
    .single();

  if (dbError) {
    const msg = dbError.code === "23505" ? "이미 사용 중인 code입니다." : dbError.message;
    return NextResponse.json({ message: msg }, { status: 409 });
  }
  return NextResponse.json(data, { status: 201 });
}
