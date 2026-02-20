import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { username, nickname, password } = await request.json();

  if (!username || !nickname || !password) {
    return NextResponse.json(
      { message: "모든 항목을 입력하세요." },
      { status: 400 }
    );
  }

  // username 중복 확인
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      { field: "username", message: "이미 사용 중인 아이디입니다." },
      { status: 409 }
    );
  }

  // nickname 중복 확인
  const { data: existingNickname } = await supabase
    .from("users")
    .select("id")
    .eq("name", nickname)
    .maybeSingle();

  if (existingNickname) {
    return NextResponse.json(
      { field: "nickname", message: "이미 사용 중인 닉네임입니다." },
      { status: 409 }
    );
  }

  const password_hash = await bcrypt.hash(password, 12);

  const { error } = await supabase.from("users").insert({
    username,
    name: nickname,
    password_hash,
    role: "member",
    is_active: true,
  });

  if (error) {
    return NextResponse.json(
      { message: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
