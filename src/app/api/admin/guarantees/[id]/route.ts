import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { isHttpUrl, trimUrl } from "@/util/url";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const { name, link } = await request.json();

  if (!name || !link) {
    return NextResponse.json({ message: "name과 link를 입력하세요." }, { status: 400 });
  }

  const normalizedLink = trimUrl(link);
  if (!isHttpUrl(normalizedLink)) {
    return NextResponse.json(
      { message: "링크는 http:// 또는 https://로 시작해야 합니다." },
      { status: 400 },
    );
  }

  const { data, error: dbError } = await supabase
    .from("guarantee")
    .update({ name, link: normalizedLink })
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const { error: dbError } = await supabase
    .from("guarantee")
    .delete()
    .eq("id", id);

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
