import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  // 현재 is_active 상태 조회
  const { data: user, error: findError } = await supabase
    .from("users")
    .select("id, is_active")
    .eq("id", numId)
    .maybeSingle();

  if (findError || !user) {
    return NextResponse.json({ message: "회원을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("users")
    .update({ is_active: !user.is_active })
    .eq("id", numId)
    .select("id, username, nickname, role, is_active, created_at")
    .single();

  if (error) {
    return NextResponse.json({ message: "수정 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  const { error } = await supabase.from("users").delete().eq("id", numId);

  if (error) {
    return NextResponse.json({ message: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
