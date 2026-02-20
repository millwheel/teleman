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
  const { direction } = await request.json();

  const { data: current } = await supabase
    .from("text_banners")
    .select("id, sort_order, category_id")
    .eq("id", id)
    .single();

  if (!current) return NextResponse.json({ message: "항목을 찾을 수 없습니다." }, { status: 404 });

  const targetOrder =
    direction === "up" ? current.sort_order - 1 : current.sort_order + 1;

  const { data: adjacent } = await supabase
    .from("text_banners")
    .select("id, sort_order")
    .eq("category_id", current.category_id)
    .eq("sort_order", targetOrder)
    .maybeSingle();

  if (!adjacent) return NextResponse.json({ ok: true });

  await Promise.all([
    supabase.from("text_banners").update({ sort_order: targetOrder }).eq("id", current.id),
    supabase.from("text_banners").update({ sort_order: current.sort_order }).eq("id", adjacent.id),
  ]);

  return NextResponse.json({ ok: true });
}
