import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { signJwt, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { message: "아이디와 비밀번호를 입력하세요." },
      { status: 400 }
    );
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, password_hash, role, is_active")
    .eq("username", username)
    .single();

  if (!user) {
    return NextResponse.json(
      { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  if (!user.is_active) {
    return NextResponse.json(
      { message: "비활성화된 계정입니다. 관리자에게 문의하세요." },
      { status: 403 }
    );
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return NextResponse.json(
      { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const token = await signJwt({ userId: Number(user.id), role: user.role });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
