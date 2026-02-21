import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, username, nickname, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { username, nickname, password } = await request.json();

  if (!username?.trim() || !nickname?.trim() || !password) {
    return NextResponse.json({ message: "모든 항목을 입력하세요." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ message: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  const { data: existingUsername } = await supabase
    .from("users")
    .select("id")
    .eq("username", username.trim())
    .maybeSingle();

  if (existingUsername) {
    return NextResponse.json({ message: "이미 사용 중인 아이디입니다." }, { status: 409 });
  }

  const { data: existingNickname } = await supabase
    .from("users")
    .select("id")
    .eq("nickname", nickname.trim())
    .maybeSingle();

  if (existingNickname) {
    return NextResponse.json({ message: "이미 사용 중인 닉네임입니다." }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from("users")
    .insert({ username: username.trim(), nickname: nickname.trim(), password_hash, role: "admin", is_active: true })
    .select("id, username, nickname, created_at")
    .single();

  if (error) {
    return NextResponse.json({ message: "생성 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
