import { NextResponse } from "next/server";
import { getSession, signJwt, setSessionCookie } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
  }

  if (!session.imagePath) {
    return NextResponse.json({ message: "삭제할 이미지가 없습니다." }, { status: 400 });
  }

  // Storage에서 파일 삭제
  const { error: storageError } = await supabase.storage
    .from("public-media")
    .remove([session.imagePath]);

  if (storageError) {
    console.error("[profile/delete-image] storage error:", storageError);
    return NextResponse.json({ message: "이미지 삭제에 실패했습니다." }, { status: 500 });
  }

  // DB 업데이트
  const { error: dbError } = await supabase
    .from("users")
    .update({ image_path: null })
    .eq("id", session.userId);

  if (dbError) {
    console.error("[profile/delete-image] db error:", dbError);
    return NextResponse.json({ message: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  // JWT 재발급
  const newToken = await signJwt({
    userId: session.userId,
    role: session.role,
    nickname: session.nickname,
    imagePath: null,
  });
  await setSessionCookie(newToken);

  return NextResponse.json({ ok: true });
}
