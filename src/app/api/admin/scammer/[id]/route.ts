import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { uploadImage, deleteImage, getPublicImageUrl } from "@/lib/storage";
import { validateFileSize } from "@/util/file";

const SCAMMER_SELECT =
  "id, name, phone_number, bank_account, description, image_path, public_url, created_at";

function stripHyphens(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  return value.replace(/-/g, "").trim();
}

export async function PATCH(
  request: NextRequest,
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

  const formData = await request.formData();
  const cleanName = (formData.get("name") as string | null)?.trim() || null;
  const cleanPhone = stripHyphens(formData.get("phone_number") as string | null);
  const cleanAccount = stripHyphens(formData.get("bank_account") as string | null);
  const cleanDesc = (formData.get("description") as string | null)?.trim() || null;
  const file = formData.get("image") as File | null;
  const removeImage = formData.get("removeImage") === "true";

  if (!cleanName && !cleanPhone && !cleanAccount) {
    return NextResponse.json(
      { message: "이름, 전화번호, 계좌번호 중 최소 하나를 입력하세요." },
      { status: 400 }
    );
  }

  const fileSizeError = validateFileSize(file);
  if (fileSizeError) return fileSizeError;

  const { data: existing, error: existingError } = await supabase
    .from("scammer")
    .select("image_path")
    .eq("id", numId)
    .single();

  if (existingError) {
    return NextResponse.json({ message: "수정 대상이 존재하지 않습니다." }, { status: 404 });
  }

  const updatePayload: Record<string, string | number | null> = {
    name: cleanName,
    phone_number: cleanPhone,
    bank_account: cleanAccount,
    description: cleanDesc,
  };

  let newUploadedPath: string | null = null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `scammers/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      await uploadImage(path, buffer, file.type);
      newUploadedPath = path;
      updatePayload.image_path = path;
      updatePayload.public_url = getPublicImageUrl(path);
    } catch (e) {
      console.error("[PATCH /api/admin/scammer] upload error", e);
      return NextResponse.json(
        { message: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }
  } else if (removeImage) {
    updatePayload.image_path = null;
    updatePayload.public_url = null;
  }

  const { data, error } = await supabase
    .from("scammer")
    .update(updatePayload)
    .eq("id", numId)
    .select(SCAMMER_SELECT)
    .single();

  if (error) {
    console.error("[PATCH /api/admin/scammer] supabase error", error);
    if (newUploadedPath) {
      await deleteImage(newUploadedPath).catch(() => {});
    }
    return NextResponse.json({ message: "수정 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 새 이미지로 교체 또는 제거 성공 시 기존 파일 정리
  if ((newUploadedPath || removeImage) && existing?.image_path) {
    await deleteImage(existing.image_path).catch(() => {});
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

  const { data: existing } = await supabase
    .from("scammer")
    .select("image_path")
    .eq("id", numId)
    .maybeSingle();

  const { error } = await supabase.from("scammer").delete().eq("id", numId);

  if (error) {
    return NextResponse.json({ message: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }

  if (existing?.image_path) {
    await deleteImage(existing.image_path).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
