import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const { nickname } = await request.json();

  if (!nickname?.trim()) {
    return NextResponse.json({ message: "닉네임을 입력하세요." }, { status: 400 });
  }

  const { data: existingNickname } = await supabase
    .from("users")
    .select("id")
    .eq("nickname", nickname.trim())
    .neq("id", id)
    .maybeSingle();

  if (existingNickname) {
    return NextResponse.json({ message: "이미 사용 중인 닉네임입니다." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("users")
    .update({ nickname: nickname.trim() })
    .eq("id", id)
    .select("id, username, nickname, created_at")
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

  // 자기 자신 삭제 방지
  if (Number(id) === session.userId) {
    return NextResponse.json({ message: "자기 자신은 삭제할 수 없습니다." }, { status: 400 });
  }

  // 관리자 수 확인
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if ((count ?? 0) <= 1) {
    return NextResponse.json({ message: "관리자는 최소 1명 이상 있어야합니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ message: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
