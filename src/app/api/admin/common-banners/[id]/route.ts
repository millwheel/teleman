import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";

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

  const { data, error: dbError } = await supabase
    .from("common_banner")
    .update({ name, link })
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
    .from("common_banner")
    .delete()
    .eq("id", id);

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
