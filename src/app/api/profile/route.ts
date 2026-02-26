import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const STORAGE_BASE = `${process.env.SUPABASE_URL}/storage/v1/object/public/public-media`;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });

  const { data: user } = await supabase
    .from("users")
    .select("username, nickname, image_path")
    .eq("id", session.userId)
    .single();

  if (!user) return NextResponse.json({ message: "사용자를 찾을 수 없습니다." }, { status: 404 });

  const imageUrl = user.image_path ? `${STORAGE_BASE}/${user.image_path}` : null;

  return NextResponse.json({ username: user.username, nickname: user.nickname, imageUrl });
}
