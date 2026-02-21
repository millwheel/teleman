import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession, signJwt, setSessionCookie } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const STORAGE_BASE = `${process.env.SUPABASE_URL}/storage/v1/object/public/public-media`;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const nickname = (formData.get("nickname") as string)?.trim();
  const imageFile = formData.get("image") as File | null;
  const newPassword = (formData.get("password") as string) || null;

  if (!nickname) {
    return NextResponse.json({ message: "닉네임을 입력하세요." }, { status: 400 });
  }

  if (newPassword !== null && newPassword.length < 8) {
    return NextResponse.json({ message: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  // 닉네임 중복 확인 (본인 제외)
  if (nickname !== session.nickname) {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("nickname", nickname)
      .neq("id", session.userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: "이미 사용 중인 닉네임입니다." }, { status: 409 });
    }
  }

  let imagePath = session.imagePath;

  // 이미지 업로드
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const storagePath = `avatars/${session.userId}/profile.${ext}`;

    const arrayBuffer = await imageFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("public-media")
      .upload(storagePath, arrayBuffer, {
        contentType: imageFile.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[profile/update] upload error:", uploadError);
      return NextResponse.json({ message: "이미지 업로드에 실패했습니다." }, { status: 500 });
    }

    imagePath = storagePath;
  }

  // DB 업데이트
  const updatePayload: Record<string, unknown> = { nickname, image_path: imagePath };
  if (newPassword) {
    updatePayload.password_hash = await bcrypt.hash(newPassword, 12);
  }

  const { error: dbError } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", session.userId);

  if (dbError) {
    console.error("[profile/update] db error:", dbError);
    return NextResponse.json({ message: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  // JWT 재발급
  const newToken = await signJwt({
    userId: session.userId,
    role: session.role,
    nickname,
    imagePath,
  });
  await setSessionCookie(newToken);

  const imageUrl = imagePath ? `${STORAGE_BASE}/${imagePath}` : null;

  return NextResponse.json({ nickname, imagePath, imageUrl });
}
